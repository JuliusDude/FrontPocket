import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

export interface VisionAnalysisResult {
  tags: string[];
  rebuild_prompt: string;
}

const SYSTEM_PROMPT = `You are an elite senior frontend/UI design analyst and AI coding architect. You are shown one screenshot of a website or app interface. Your job is to reverse-engineer the design and generate the ultimate "Rebuild Prompt" that another AI coding agent can use to perfectly recreate this UI.

Produce two things:

1. TAGS: 3-6 short lowercase tags capturing its design "taste" (e.g. neo-brutalist, glassmorphic, collage, corporate-saas, experimental).

2. REBUILD_PROMPT: The format of this prompt string MUST dynamically adapt based on the aesthetic detected in the image:

--- IF THE DESIGN IS STRUCTURED/CORPORATE (e.g. dashboards, SaaS, clean minimal, e-commerce) ---
Use the Strict Dual-Part Template. The string must contain a Text Brief and a Structured Spec JSON block formatted exactly like this:

## Part 1: Text Brief
- **Subject & purpose**: What does this page need to do?
- **Audience**: Who's looking at it, and what do they expect?
- **Personality, translated**: Concrete design decisions.
- **Reference**: Specific things to take vs. avoid.
- **Content voice**: How the copy should sound.

## Part 2: Structured Spec
\`\`\`json
{
  "meta": { "purpose": "", "audience": "", "personality_keywords": [], "reference_url": "" },
  "color": { "background": "", "surface": "", "text_primary": "", "text_secondary": "", "accent": "", "accent_hover": "" },
  "typography": {
    "display": { "role": "", "family": "", "source": "google-fonts | system", "fallback_stack": "", "weights_used": [], "size": { "mobile": "", "desktop": "" }, "line_height": 1.05, "letter_spacing": "", "text_transform": "" },
    "body": { "role": "", "family": "", "source": "", "fallback_stack": "", "weights_used": [], "size": { "mobile": "", "desktop": "" }, "line_height": 1.6, "letter_spacing": "", "text_transform": "" }
  },
  "layout": { "max_width": "1440px", "grid_columns": 12, "spacing_scale": [4, 8, 16, 24, 32, 48, 64, 96, 128], "sections": [ { "name": "", "structure": "" } ] },
  "motion": { "page_load": [], "scroll_triggers": [], "hover_states": [] },
  "imagery": { "style": "", "treatment": "" },
  "signature_element": ""
}
\`\`\`

--- IF THE DESIGN IS EXPERIMENTAL/CREATIVE (e.g. chaotic, collage, highly asymmetric, heavy 3D, immersive) ---
Use the Narrative Blueprint Template. Write a continuous, highly descriptive markdown paragraph that focuses on the "feel" and creative execution rather than strict grids. Format exactly like this:

- **Architecture & Layout**: Describe the fluid/asymmetric layout, overlapping elements, and broken grids.
- **Color Design System**: List the exact HEX colors and how they clash or harmonize.
- **Typography & Hierarchy**: Specify the font families, extreme scale variations, and typographic treatments.
- **Spacing & Overlap**: Describe how elements intentionally crowd, overlap, or drift to create depth.
- **Component Specs & Materials**: Detail textures (e.g. grain, glass, claymorphism) and irregular shapes.
- **Motion & Micro-interactions**: Suggest organic, drift-like, or scroll-tied immersive animations.

Return strictly as JSON: {"tags": [...], "rebuild_prompt": "..."}.
The rebuild_prompt string MUST contain ONLY the template you chose. No commentary outside the root JSON.`;

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
    const selectedModel = modelOverride || process.env.VISION_MODEL || 'gemini-3.1-flash-lite';
    
    // Fallback to gemini-3.1-flash-lite if invalid model string
    const modelName = selectedModel.includes('claude') ? 'gemini-3.1-flash-lite' : selectedModel;
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
