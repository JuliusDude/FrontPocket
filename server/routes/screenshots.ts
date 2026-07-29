import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbService } from '../db';
import { analyzeScreenshot } from '../vision';

const router = Router();

// Configure storage for Multer
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueId = 'img_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (PNG, JPG, WEBP, GIF) are supported.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Helper to trigger background vision analysis
function triggerBackgroundAnalysis(id: string, fullPath: string) {
  analyzeScreenshot(fullPath)
    .then((result) => {
      dbService.updateScreenshotAnalysis(id, result.rebuild_prompt, result.tags);
    })
    .catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      dbService.setScreenshotError(id, msg);
    });
}

// POST /api/screenshots - Upload image & trigger AI analysis
router.post('/', (req: Request, res: Response) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload error' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const id = path.parse(req.file.filename).name;
    const relativePath = `/uploads/${req.file.filename}`;
    const fullPath = req.file.path;

    // Create DB row immediately with 'analyzing' status
    const record = dbService.createScreenshot(id, relativePath);

    // Trigger non-blocking async analysis
    triggerBackgroundAnalysis(id, fullPath);

    return res.status(201).json(record);
  });
});

// GET /api/screenshots - List screenshots with optional filtering/search/sort
router.get('/', (req: Request, res: Response) => {
  try {
    const { tag, search, sort } = req.query;
    const sortVal = sort === 'oldest' || sort === 'most_tags' || sort === 'newest' ? (sort as 'oldest' | 'most_tags' | 'newest') : undefined;
    const filter = {
      tag: typeof tag === 'string' ? tag : undefined,
      search: typeof search === 'string' ? search : undefined,
      sort: sortVal,
    };

    const screenshots = dbService.getScreenshots(filter);
    return res.json(screenshots);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve screenshots' });
  }
});

// GET /api/screenshots/:id - Full detail of a screenshot
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const screenshot = dbService.getScreenshotById(req.params.id);
    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }
    return res.json(screenshot);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve screenshot detail' });
  }
});

// PATCH /api/screenshots/:id - Manually edit tags, prompt, notes
router.patch('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { userEditedPrompt, notes, rebuildPrompt, tags } = req.body;
    const updated = dbService.updateScreenshot(req.params.id, {
      userEditedPrompt,
      notes,
      rebuildPrompt,
      tags,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update screenshot' });
  }
});

// DELETE /api/screenshots/:id - Delete image file, DB row, and tag links
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const screenshotId = req.params.id;
    const screenshot = dbService.getScreenshotById(screenshotId);
    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    // Delete file from disk if it exists
    const diskPath = path.join(process.cwd(), screenshot.filePath.replace(/^\//, ''));
    if (fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch (_) {}
    }

    dbService.deleteScreenshot(screenshotId);
    return res.json({ message: 'Screenshot deleted successfully', id: screenshotId });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete screenshot' });
  }
});

// POST /api/screenshots/bulk-delete - Delete multiple cards
router.post('/bulk-delete', (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array of screenshot IDs' });
    }

    const deletedRows = dbService.bulkDeleteScreenshots(ids);

    // Delete image files from disk
    for (const screenshot of deletedRows) {
      const diskPath = path.join(process.cwd(), screenshot.filePath.replace(/^\//, ''));
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (_) {}
      }
    }

    return res.json({ message: `Successfully deleted ${deletedRows.length} screenshots`, deletedIds: deletedRows.map((r) => r.id) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to bulk delete screenshots' });
  }
});

// POST /api/screenshots/:id/regenerate - Re-run AI analysis
router.post('/:id/regenerate', (req: Request<{ id: string }>, res: Response) => {
  try {
    const screenshotId = req.params.id;
    const screenshot = dbService.getScreenshotById(screenshotId);
    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    const diskPath = path.join(process.cwd(), screenshot.filePath.replace(/^\//, ''));
    if (!fs.existsSync(diskPath)) {
      return res.status(404).json({ error: 'Image file does not exist on disk' });
    }

    // Set status back to analyzing
    dbService.setScreenshotAnalyzing(screenshotId);
    const updated = dbService.getScreenshotById(screenshotId);

    // Re-run background analysis
    triggerBackgroundAnalysis(screenshotId, diskPath);

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to trigger regeneration' });
  }
});

export default router;
