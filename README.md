# PromptPen

AI-powered writing assistant for Chrome and Firefox. Select text on any webpage and instantly improve, rewrite, or transform it with your preferred AI provider.

## Features

- **Rewrite** — Improve writing, fix grammar, simplify language, or rewrite as a single sentence/paragraph
- **Tone adjustment** — 15+ tones: professional, casual, friendly, confident, thoughtful, optimistic, and more
- **Transform** — Convert text into bullet lists, numbered lists, or summaries
- **Modify** — Shorten, expand, summarize, or explain selected text
- **Custom prompts** — Create and save your own reusable writing prompts
- **Multi-provider** — Use any provider with OpenAI-compatible APIs
- **Website access control** — Enable/disable on specific sites
- **Dark mode** — System-aware theming with manual override
- **Keyboard shortcuts** — Quick access via configurable hotkeys (`Alt+T` toggle toolbar, etc.)
- **Context menu** — Right-click selected text to open actions

## Supported Providers

OpenAI, OpenRouter, Anthropic, Gemini, Groq, Ollama (local), Together AI, Cohere, DeepSeek, Mistral, OpenAI Compatible.

## Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

## Getting Started

```bash
pnpm install
pnpm postinstall
```

## Development

```bash
# Chrome (default)
pnpm run dev

# Firefox
pnpm run dev:firefox
```

This starts the extension in watch mode with hot reload and opens a browser instance.

## Build

```bash
# Chrome
pnpm run build
pnpm run zip      # creates .output/promptpen-*.zip

# Firefox
pnpm run build:firefox
pnpm run zip:firefox
```

## Install in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the `.output/chrome-mv3/` directory
4. The PromptPen icon appears in the toolbar

## Install in Firefox

### Temporary (development)

1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `.output/firefox-mv2/manifest.json` file

### Permanent (signed)

1. Go to `about:addons`
2. Click the gear icon → **Install Add-on From File**
3. Select the built `.zip` from `pnpm run zip:firefox`

Alternatively, zip the `.output/firefox-mv2/` directory and submit it through [AMO](https://addons.mozilla.org).

## Type quality

```bash
pnpm run compile     # TypeScript check
pnpm run doctor      # React Doctor lint
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [WXT](https://wxt.dev) (browser extension framework) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4, Shadcn UI |
| Animation | Framer Motion |
| Icons | Lucide React |
| AI SDK | Vercel AI SDK (`ai`) |
| State | Zustand |
| Build | Vite, WXT module system |
| Linting | Biome, Ultracite |
| Runtime | MV3 (Chrome) / MV2 (Firefox) |
