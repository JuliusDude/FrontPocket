# FrontPocket

FrontPocket is a local, Pinterest-inspired design reference and prompt vault. It allows you to upload screenshots of frontend designs, automatically tags them by their design "taste" using AI, and generates a detailed prompt that can be used with AI coding agents to rebuild the exact UI.

## Features

- **Pinterest Aesthetic**: A beautifully crafted UI inspired closely by Pinterest's design system (masonry layout, custom pill buttons, accurate spacing, typography, and contrast).
- **AI Vision Analysis**: Integrates with Google Gemini (or Anthropic Claude) to automatically tag design patterns and extract code-ready structural prompts from your uploaded screenshots.
- **Prompt Vault**: View generated prompts in a sleek, dark-themed code vault, copy them with a single click, and seamlessly pass them to your coding agents.
- **Local First**: Built with an Express server and SQLite database ensuring your reference library runs quickly and securely on `localhost`.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (via `better-sqlite3`)
- **AI Integration**: Google Generative AI SDK, Anthropic SDK

## Getting Started

### 1. Installation

Install the project dependencies:
```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the project (you can use `.env.example` as a template):
```bash
cp .env.example .env
```

Open `.env` and add your **Google Gemini API Key** (or Anthropic key):
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```
*Note: The app requires a valid AI API key in the `.env` file to successfully auto-tag uploads and generate rebuild prompts.*

### 3. Run the App

Start both the backend server and the frontend Vite development server concurrently:
```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000) and the backend API runs on `http://localhost:5000`.

## Scripts

- `npm run dev`: Starts the development servers.
- `npm run build`: Compiles TypeScript and builds the Vite frontend for production.

## License
MIT
