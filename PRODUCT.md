# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Single frontend developer, UI/UX designer, or AI pair programmer collecting real-world web interface inspiration locally on their machine to generate structured, production-ready rebuild prompts for AI coding agents.

## Product Purpose
FrontPocket is a single-user local design reference and prompt vault. It allows users to upload frontend design screenshots (via drag & drop, file picker, or clipboard paste `Ctrl+V`), automatically analyzes and tags each image by its design "taste", and generates detailed structured prompts for AI coding tools to rebuild that exact look.

## Positioning
An offline-first, zero-dependency local design reference vault that turns visual UI screenshots into structured AI rebuild prompts on localhost with zero external service dependencies beyond a local vision API key.

## Operating Context
- Localhost web application running on desktop (Node.js Express + React Vite + SQLite).
- Drag-and-drop, clipboard paste (`Ctrl+V`), and file picker input workflows.
- Visual gallery pin discovery mode + deliberate detail view modal inspection.

## Capabilities and Constraints
- **Core Functionality**:
  - Image upload via drag-and-drop, file picker, and clipboard paste (`Ctrl+V`).
  - Asynchronous background vision analysis using Google Gemini Studio API (`gemini-2.5-flash`) or Anthropic Claude API.
  - Automatic extraction of 3-6 design taste tags (e.g., `#neo-brutalist`, `#glassmorphic`, `#notion-style-minimal`) and detailed structured rebuild prompts.
  - Pinterest-inspired fluid masonry gallery layout with tag chips underneath cards and 1-click quick prompt copying.
  - Detail View Modal with full screenshot frame, interactive tag editor, personal notes, monospace prompt code block, prompt export (`.md`/`.txt`), manual prompt editing, AI re-analysis, and card deletion.
  - Search across prompts, tags, and notes + Tag filter bar + Sorting options (Newest, Oldest, Most Tags).
  - Bulk select mode for multi-card deletion.
  - Settings panel for local Google Gemini Studio API Key (`AIza...`) and model selection, persisted to local `.env`.
- **Technical Constraints**:
  - Entirely local execution on Node.js + SQLite (`better-sqlite3`).
  - API keys stored strictly in local `.env` and executed server-side.
  - Zero external database or cloud storage dependencies.

## Brand Commitments
- **Name**: FrontPocket — Local Design Reference & Prompt Vault.
- **Aesthetic Direction**: Pinterest-inspired design, modern sleek aesthetic, clean light/bright or refined theme (not dark-only), high visual craft, subtle micro-interactions.

## Evidence on Hand
- Working React + Vite + TypeScript frontend with Tailwind CSS (`src/App.tsx`, `src/components/`).
- Express backend (`server/index.ts`, `server/routes/`).
- SQLite Database schema (`server/db.ts` creating `frontpocket.db`).
- Vision AI module (`server/vision.ts` supporting Google Gemini Studio and Anthropic Claude APIs).

## Product Principles
1. **Visual Reference First**: The gallery grid prioritizes clean visual inspiration; complex rebuild prompts remain hidden until deliberately clicked or quick-copied.
2. **Zero Friction Ingestion**: Uploading screenshots must be effortless via drag-and-drop, file selection, or global `Ctrl+V` clipboard paste anywhere in the app.
3. **Structured AI Actionability**: Extracted prompts must follow a strict, structured layout covering structure, color palette, typography, spacing, component styling, and motion cues so AI coding agents can execute them directly.
4. **Local Sovereignty**: All data, images, and SQLite databases remain on the user's local filesystem; API keys live only in local `.env`.
