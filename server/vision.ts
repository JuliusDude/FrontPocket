import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

export interface VisionAnalysisResult {
  tags: string[];
  rebuild_prompt: string;
}

const SYSTEM_PROMPT = `You are a senior frontend/UI design analyst. You are shown one screenshot of a
website or app interface. Produce two things:

1. TAGS: 3-6 short lowercase tags capturing its design "taste" - a style
   movement or descriptor (e.g. neo-brutalist, glassmorphic, notion-style
   minimal, skeuomorphic, cinematic-dark), not generic words like "website"
   or "UI".

2. REBUILD_PROMPT: a detailed, structured prompt an AI coding agent could use
   to rebuild a page in this exact visual style. Cover, in this order:
   overall layout/structure, color palette (name the colors, approximate hex
   if inferable), typography (font style/weight/size relationships), spacing
   and density, component styling (buttons, cards, nav, inputs),
   motion/interaction cues if visually implied, and 2-3 words for overall mood.

Return strictly as JSON: {"tags": [...], "rebuild_prompt": "..."}.
No commentary outside the JSON.`;

function getMediaType(filePath: string): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/png';
}

export function parseVisionJSON(rawText: string): VisionAnalysisResult {
  let cleaned = rawText.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // Try parsing directly
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && Array.isArray(parsed.tags) && typeof parsed.rebuild_prompt === 'string') {
      return {
        tags: parsed.tags.map((t: any) => String(t).toLowerCase().trim()).filter(Boolean),
        rebuild_prompt: parsed.rebuild_prompt.trim(),
      };
    }
  } catch (err) {
    // Attempt regex match for JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed && Array.isArray(parsed.tags) && typeof parsed.rebuild_prompt === 'string') {
          return {
            tags: parsed.tags.map((t: any) => String(t).toLowerCase().trim()).filter(Boolean),
            rebuild_prompt: parsed.rebuild_prompt.trim(),
          };
        }
      } catch (_) {}
    }
  }

  throw new Error('Could not parse valid JSON from Vision response.');
}

// Main Vision analysis entry point supporting Google Gemini & Anthropic
export async function analyzeScreenshot(filePath: string, apiKeyOverride?: string, modelOverride?: string): Promise<VisionAnalysisResult> {
  const geminiKey = process.env.GEMINI_API_KEY || (apiKeyOverride?.startsWith('AIza') ? apiKeyOverride : undefined);
  const anthropicKey = process.env.ANTHROPIC_API_KEY || (apiKeyOverride?.startsWith('sk-') ? apiKeyOverride : undefined);
  const generalKey = apiKeyOverride || process.env.AI_API_KEY;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Screenshot file not found at path: ${filePath}`);
  }

  const imageBuffer = fs.readFileSync(filePath);
  const base64Data = imageBuffer.toString('base64');
  const mediaType = getMediaType(filePath);

  // 1. Try Gemini Vision if Gemini Key is present (or if key starts with AIza)
  if (geminiKey || (generalKey && (generalKey.startsWith('AIza') || !anthropicKey))) {
    const keyToUse = geminiKey || generalKey;
    if (!keyToUse || keyToUse.trim() === '') {
      throw new Error('Google Gemini API Key is missing. Please add your key in the .env file.');
    }

    const genAI = new GoogleGenerativeAI(keyToUse.trim());
    const selectedModel = modelOverride || process.env.VISION_MODEL || 'gemini-2.5-flash';
    
    // Fallback to gemini-1.5-flash if invalid model string
    const modelName = selectedModel.includes('claude') ? 'gemini-2.5-flash' : selectedModel;
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent([
      SYSTEM_PROMPT + '\n\nAnalyze this UI screenshot and return tags and rebuild prompt strictly as JSON.',
      {
        inlineData: {
          data: base64Data,
          mimeType: mediaType,
        },
      },
    ]);

    const response = await result.response;
    const rawText = response.text();
    return parseVisionJSON(rawText);
  }

  // 2. Fallback to Anthropic Claude Vision if Anthropic Key is present
  if (anthropicKey || (generalKey && generalKey.startsWith('sk-'))) {
    const keyToUse = anthropicKey || generalKey;
    const anthropic = new Anthropic({ apiKey: keyToUse!.trim() });
    const model = modelOverride || process.env.VISION_MODEL || 'claude-3-5-sonnet-20241022';

    const response = await anthropic.messages.create({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: 'Analyze this UI screenshot and output the tags and rebuild prompt strictly as JSON.',
            },
          ],
        },
      ],
    });

    const contentBlock = response.content[0];
    if (!contentBlock || contentBlock.type !== 'text') {
      throw new Error('Unexpected non-text response received from Anthropic Vision API.');
    }

    return parseVisionJSON(contentBlock.text);
  }

  throw new Error('No API Key configured. Please add your Google Gemini Studio API Key in the .env file.');
}
