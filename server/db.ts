import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'frontpocket.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS screenshots (
    id TEXT PRIMARY KEY,
    filePath TEXT NOT NULL,
    uploadedAt TEXT NOT NULL,
    rebuildPrompt TEXT,
    userEditedPrompt TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'analyzing',
    errorMessage TEXT
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS screenshot_tags (
    screenshotId TEXT NOT NULL,
    tagId TEXT NOT NULL,
    PRIMARY KEY (screenshotId, tagId),
    FOREIGN KEY (screenshotId) REFERENCES screenshots(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
  );
`);

export interface ScreenshotRow {
  id: string;
  filePath: string;
  uploadedAt: string;
  rebuildPrompt: string | null;
  userEditedPrompt: string | null;
  notes: string | null;
  status: 'analyzing' | 'completed' | 'error';
  errorMessage: string | null;
}

export interface TagRow {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface FullScreenshot extends ScreenshotRow {
  tags: TagRow[];
}

const PALETTE = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b',
  '#8b5cf6', '#3b82f6', '#14b8a6', '#f43f5e',
  '#a855f7', '#06b6d4', '#84cc16', '#eab308'
];

function getRandomColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export const dbService = {
  // Screenshots
  createScreenshot(id: string, filePath: string): FullScreenshot {
    const uploadedAt = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO screenshots (id, filePath, uploadedAt, status)
      VALUES (?, ?, ?, 'analyzing')
    `);
    stmt.run(id, filePath, uploadedAt);
    return {
      id,
      filePath,
      uploadedAt,
      rebuildPrompt: null,
      userEditedPrompt: null,
      notes: null,
      status: 'analyzing',
      errorMessage: null,
      tags: [],
    };
  },

  updateScreenshotAnalysis(id: string, rebuildPrompt: string, tagNames: string[]) {
    const updateStmt = db.prepare(`
      UPDATE screenshots
      SET rebuildPrompt = ?, status = 'completed', errorMessage = NULL
      WHERE id = ?
    `);
    updateStmt.run(rebuildPrompt, id);

    if (tagNames && tagNames.length > 0) {
      this.setScreenshotTags(id, tagNames);
    }
  },

  setScreenshotError(id: string, errorMessage: string) {
    const stmt = db.prepare(`
      UPDATE screenshots
      SET status = 'error', errorMessage = ?
      WHERE id = ?
    `);
    stmt.run(errorMessage, id);
  },

  setScreenshotAnalyzing(id: string) {
    const stmt = db.prepare(`
      UPDATE screenshots
      SET status = 'analyzing', errorMessage = NULL
      WHERE id = ?
    `);
    stmt.run(id);
  },

  updateScreenshot(id: string, updates: { userEditedPrompt?: string | null; notes?: string | null; rebuildPrompt?: string | null; title?: string | null; tags?: string[] }) {
    const current = db.prepare(`SELECT * FROM screenshots WHERE id = ?`).get(id) as ScreenshotRow | undefined;
    if (!current) return null;

    const userEditedPrompt = updates.userEditedPrompt !== undefined ? updates.userEditedPrompt : current.userEditedPrompt;
    const notes = updates.notes !== undefined ? updates.notes : current.notes;
    const rebuildPrompt = updates.rebuildPrompt !== undefined ? updates.rebuildPrompt : current.rebuildPrompt;
    const title = updates.title !== undefined ? updates.title : (current as any).title;

    const stmt = db.prepare(`
      UPDATE screenshots
      SET userEditedPrompt = ?, notes = ?, rebuildPrompt = ?, title = ?
      WHERE id = ?
    `);
    stmt.run(userEditedPrompt, notes, rebuildPrompt, title, id);

    if (updates.tags) {
      this.setScreenshotTags(id, updates.tags);
    }

    return this.getScreenshotById(id);
  },

  deleteScreenshot(id: string): ScreenshotRow | null {
    const screenshot = db.prepare(`SELECT * FROM screenshots WHERE id = ?`).get(id) as ScreenshotRow | undefined;
    if (!screenshot) return null;

    db.prepare(`DELETE FROM screenshot_tags WHERE screenshotId = ?`).run(id);
    db.prepare(`DELETE FROM screenshots WHERE id = ?`).run(id);

    return screenshot;
  },

  bulkDeleteScreenshots(ids: string[]): ScreenshotRow[] {
    const deleted: ScreenshotRow[] = [];
    const deleteTx = db.transaction((idList: string[]) => {
      for (const id of idList) {
        const screenshot = db.prepare(`SELECT * FROM screenshots WHERE id = ?`).get(id) as ScreenshotRow | undefined;
        if (screenshot) {
          db.prepare(`DELETE FROM screenshot_tags WHERE screenshotId = ?`).run(id);
          db.prepare(`DELETE FROM screenshots WHERE id = ?`).run(id);
          deleted.push(screenshot);
        }
      }
    });
    deleteTx(ids);
    return deleted;
  },

  getScreenshotById(id: string): FullScreenshot | null {
    const row = db.prepare(`SELECT * FROM screenshots WHERE id = ?`).get(id) as ScreenshotRow | undefined;
    if (!row) return null;

    const tags = db.prepare(`
      SELECT t.id, t.name, t.color
      FROM tags t
      JOIN screenshot_tags st ON t.id = st.tagId
      WHERE st.screenshotId = ?
      ORDER BY t.name ASC
    `).all(id) as TagRow[];

    return { ...row, tags };
  },

  getScreenshots(filter?: { tag?: string; search?: string; sort?: 'newest' | 'oldest' | 'most_tags' }): FullScreenshot[] {
    let query = `
      SELECT DISTINCT s.*
      FROM screenshots s
      LEFT JOIN screenshot_tags st ON s.id = st.screenshotId
      LEFT JOIN tags t ON st.tagId = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filter?.tag) {
      query += ` AND t.name = ?`;
      params.push(filter.tag.toLowerCase());
    }

    if (filter?.search) {
      query += ` AND (LOWER(s.rebuildPrompt) LIKE ? OR LOWER(s.userEditedPrompt) LIKE ? OR LOWER(s.notes) LIKE ? OR LOWER(t.name) LIKE ?)`;
      const searchTerm = `%${filter.search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filter?.sort === 'oldest') {
      query += ` ORDER BY s.uploadedAt ASC`;
    } else if (filter?.sort === 'most_tags') {
      query += ` ORDER BY (SELECT COUNT(*) FROM screenshot_tags WHERE screenshotId = s.id) DESC, s.uploadedAt DESC`;
    } else if (filter?.sort === 'random') {
      query += ` ORDER BY RANDOM()`;
    } else {
      query += ` ORDER BY s.uploadedAt DESC`;
    }

    const rows = db.prepare(query).all(...params) as ScreenshotRow[];

    return rows.map((row) => {
      const tags = db.prepare(`
        SELECT t.id, t.name, t.color
        FROM tags t
        JOIN screenshot_tags st ON t.id = st.tagId
        WHERE st.screenshotId = ?
        ORDER BY t.name ASC
      `).all(row.id) as TagRow[];

      return { ...row, tags };
    });
  },

  // Tags
  getOrCreateTag(name: string): TagRow {
    const cleanName = name.trim().toLowerCase();
    const existing = db.prepare(`SELECT * FROM tags WHERE name = ?`).get(cleanName) as TagRow | undefined;
    if (existing) return existing;

    const id = 'tag_' + Math.random().toString(36).substring(2, 9);
    const color = getRandomColor(cleanName);
    db.prepare(`INSERT INTO tags (id, name, color) VALUES (?, ?, ?)`).run(id, cleanName, color);
    return { id, name: cleanName, color };
  },

  setScreenshotTags(screenshotId: string, tagNames: string[]) {
    // Clear existing tag links for screenshot
    db.prepare(`DELETE FROM screenshot_tags WHERE screenshotId = ?`).run(screenshotId);

    const uniqueNames = Array.from(new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean)));
    const insertLink = db.prepare(`INSERT INTO screenshot_tags (screenshotId, tagId) VALUES (?, ?)`);

    for (const name of uniqueNames) {
      const tag = this.getOrCreateTag(name);
      insertLink.run(screenshotId, tag.id);
    }
  },

  getAllTags(): TagRow[] {
    const rows = db.prepare(`
      SELECT t.id, t.name, t.color, COUNT(st.screenshotId) as count
      FROM tags t
      LEFT JOIN screenshot_tags st ON t.id = st.tagId
      GROUP BY t.id
      ORDER BY count DESC, t.name ASC
    `).all() as TagRow[];
    return rows;
  }
};
