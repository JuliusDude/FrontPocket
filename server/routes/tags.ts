import { Router, Request, Response } from 'express';
import { dbService } from '../db';

const router = Router();

// GET /api/tags - List all tags with usage counts
router.get('/', (_req: Request, res: Response) => {
  try {
    const tags = dbService.getAllTags();
    return res.json(tags);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve tags' });
  }
});

export default router;
