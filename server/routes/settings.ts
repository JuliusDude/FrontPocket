import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const envPath = path.join(process.cwd(), '.env');

function updateEnvFile(updates: Record<string, string>) {
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const lines = envContent.split(/\r?\n/);
  const keyMap = { ...updates };

  const newLines = lines.map((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      if (key in keyMap) {
        const val = keyMap[key];
        delete keyMap[key];
        return `${key}=${val}`;
      }
    }
    return line;
  });

  for (const [key, val] of Object.entries(keyMap)) {
    newLines.push(`${key}=${val}`);
  }

  fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
}

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length > 8) {
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  }
  return '****';
}

// GET /api/settings - Get API key status
router.get('/', (_req: Request, res: Response) => {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const model = process.env.VISION_MODEL || 'gemini-2.5-flash';

  return res.json({
    hasApiKey: Boolean((geminiKey && geminiKey.trim()) || (anthropicKey && anthropicKey.trim())),
    hasGeminiKey: Boolean(geminiKey && geminiKey.trim()),
    hasAnthropicKey: Boolean(anthropicKey && anthropicKey.trim()),
    geminiKeyMasked: maskKey(geminiKey),
    anthropicKeyMasked: maskKey(anthropicKey),
    apiKeyMasked: maskKey(geminiKey || anthropicKey),
    model,
  });
});

// POST /api/settings - Save API keys and model choice
router.post('/', (req: Request, res: Response) => {
  try {
    const { geminiApiKey, anthropicApiKey, apiKey, model } = req.body;
    const updates: Record<string, string> = {};

    if (typeof geminiApiKey === 'string' && geminiApiKey.trim()) {
      process.env.GEMINI_API_KEY = geminiApiKey.trim();
      updates['GEMINI_API_KEY'] = geminiApiKey.trim();
    } else if (typeof apiKey === 'string' && apiKey.trim().startsWith('AIza')) {
      process.env.GEMINI_API_KEY = apiKey.trim();
      updates['GEMINI_API_KEY'] = apiKey.trim();
    }

    if (typeof anthropicApiKey === 'string' && anthropicApiKey.trim()) {
      process.env.ANTHROPIC_API_KEY = anthropicApiKey.trim();
      updates['ANTHROPIC_API_KEY'] = anthropicApiKey.trim();
    } else if (typeof apiKey === 'string' && apiKey.trim().startsWith('sk-')) {
      process.env.ANTHROPIC_API_KEY = apiKey.trim();
      updates['ANTHROPIC_API_KEY'] = apiKey.trim();
    } else if (typeof apiKey === 'string' && apiKey.trim() && !apiKey.trim().startsWith('AIza')) {
      // General API key provided
      process.env.GEMINI_API_KEY = apiKey.trim();
      updates['GEMINI_API_KEY'] = apiKey.trim();
    }

    if (typeof model === 'string' && model.trim()) {
      process.env.VISION_MODEL = model.trim();
      updates['VISION_MODEL'] = model.trim();
    }

    updateEnvFile(updates);

    const updatedGemini = process.env.GEMINI_API_KEY || '';
    const updatedAnthropic = process.env.ANTHROPIC_API_KEY || '';
    const currentModel = process.env.VISION_MODEL || 'gemini-2.5-flash';

    return res.json({
      message: 'Settings updated successfully',
      hasApiKey: Boolean((updatedGemini && updatedGemini.trim()) || (updatedAnthropic && updatedAnthropic.trim())),
      hasGeminiKey: Boolean(updatedGemini && updatedGemini.trim()),
      hasAnthropicKey: Boolean(updatedAnthropic && updatedAnthropic.trim()),
      geminiKeyMasked: maskKey(updatedGemini),
      anthropicKeyMasked: maskKey(updatedAnthropic),
      apiKeyMasked: maskKey(updatedGemini || updatedAnthropic),
      model: currentModel,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
