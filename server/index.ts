import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import screenshotRoutes from './routes/screenshots';
import tagRoutes from './routes/tags';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded image files statically
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use('/api/screenshots', screenshotRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'FrontPocket API', timestamp: new Date().toISOString() });
});

// Fallback error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 FrontPocket Express Backend listening on http://localhost:${PORT}`);
});
