# PromptPen (Beta)

AI-powered writing assistant for Chrome and Firefox. Select text on any webpage and instantly improve, rewrite, or transform it with your preferred AI provider.

> **Beta notice:** 99% of features are fully operational. Please test it out and report bugs to [contact@frontendweb.agency](mailto:contact@frontendweb.agency) to help us reach stable release.

## Features

- **Rewrite** — Improve writing, fix grammar, simplify language, or rewrite as a single sentence/paragraph
- **Tone adjustment** — 15+ tones: professional, casual, friendly, confident, thoughtful, optimistic, and more
- **Transform** — Convert text into bullet lists, numbered lists, or summaries
- **Modify** — Shorten, expand, summarize, or explain selected text
- **Custom prompts** — Create and save your own reusable writing prompts
- **Multi-provider** — Use any provider with OpenAI-compatible APIs
- **Website access control** — Enable/disable on specific sites
- **Dark mode** — System-aware theming with manual override
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

# Firefox (MV2 — default)
pnpm run build:firefox
pnpm run zip:firefox

# Firefox (MV3 — experimental)
pnpm run zip:firefox:mv3
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
3. Select `.output/firefox-mv2/manifest.json` (or `.output/firefox-mv3/manifest.json` for MV3)

### Permanent (signed via AMO)

1. Run `pnpm run zip:firefox` — produces two files in `.output/`:
   - `promptpen-*-firefox.zip` (compiled extension)
   - `promptpen-*-sources.zip` (raw source code for review)
2. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/) and submit the extension
3. Upload **both** ZIPs when prompted (required for minified/bundled code)
4. In **Reviewer Directions**, paste:
   > "This is a beta release (v0.1.0-beta1). 99% of features are fully functional. Refer to the README in the sources ZIP for WXT build instructions: run `pnpm install && pnpm run zip:firefox` to reproduce the build. Node.js 22+, pnpm required."
5. Select **Yes** when asked "Does your add-on contain minified or machine-generated code?"

## Usage Guide

### 1. Add an AI Provider

Open the extension settings (right-click the PromptPen icon → **Options** or **Dashboard**). Go to the **AI Providers** tab.

### 2. Select a Provider

Click on a provider from the list — for example, **OpenRouter**.

### 3. Add Model, API Key, Test, and Save

Enter your model name (e.g. `openai/gpt-4o-mini`) and your API key from OpenRouter. Click **Test Connection** to verify everything works, then click **Save**.

### 4. Reload the Website

Reload the webpage where you want to use PromptPen. The extension is now active on that site.

### 5. Select Text

Select any text on the page with your mouse. A floating toolbar icon appears near the selection.

### 6. Open Actions

Click the toolbar icon to open the full PromptPen action panel. You'll see all available actions grouped by category: Rewrite, Modify, Tone, Transform.

### 7. Choose an Action

Click any action — for example **Improve writing** or **Fix spelling and grammar**. PromptPen processes your selected text using the AI provider.

### 8. Review the Result

The result appears in a dialog with two options:

- **Copy** — copies the result to your clipboard
- **Replace** — replaces your selected text with the new version

![PromptPen in action](https://via.placeholder.com/800x450/1e1d8f/ffffff?text=PromptPen+Screenshot)

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

## Community

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
