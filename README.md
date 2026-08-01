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
- **Local AI (Transformers.js)** — Run LLMs fully in-browser with ONNX Runtime, no API key or internet required after download
- **Local AI (Ollama)** — Connect to models running on your own machine
- **Website access control** — Enable/disable on specific sites
- **Dark mode** — System-aware theming with manual override
- **Context menu** — Right-click selected text to open actions

## Supported Providers

OpenAI, OpenRouter, Anthropic, Gemini, Groq, Ollama (local), Together AI, Cohere, DeepSeek, Mistral, OpenAI Compatible, **Transformers.js (in-browser, offline)**.

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

### 4. Use Local AI (Transformers.js)

Transformers.js runs models entirely in your browser — no API key, no account, and no data leaves your device.

1. Open the extension settings → **Self-Hosted** tab.
2. In the **Transformers.js** card, pick a recommended model (e.g. `Qwen2.5-0.5B-Instruct`) or type any ONNX model ID from the [onnx-community](https://huggingface.co/onnx-community) organization.
3. Click **Add**, then **Download**. The model is downloaded from Hugging Face and cached locally with download progress shown.
4. For gated or private models, paste a **Hugging Face access token** and click **Save Token** first.

**Recommended models**

| Model | Parameters | Best for |
|---|---|---|
| [Qwen2.5-0.5B-Instruct](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA) | 0.5B | Best overall — strong instruction following, grammar, and tone |
| [Qwen2.5-1.5B-Instruct](https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct-ONNX-MHA) | 1.5B | Most capable for complex writing — needs ~4GB RAM, longer download |
| [SmolLM2-360M-Instruct](https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX-MHA) | 360M | Lightweight and fast, decent quality for short text |
| [SmolLM2-135M-Instruct](https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA) | 135M | Fastest fallback for simple rewrites |

> **Requirements:** WebAssembly (SIMD recommended), at least 2 CPU cores, and 2GB+ RAM minimum. For **fast results**, use a machine with **8GB+ RAM**. The Options page checks your system and warns you if it can't run local models.
>
> **Tips:** Stick to models under 3B parameters for good in-browser speed. Only models with pre-converted ONNX weights work — browse [onnx-community](https://huggingface.co/onnx-community) for compatible ones. Gated models (e.g. Llama 3) need a Hugging Face access token.

### 5. Use Local AI (Ollama)

If you run [Ollama](https://ollama.com) on your machine, connect it directly:

1. Open the extension settings → **Self-Hosted** tab.
2. In the **Ollama** card, set the **Base URL** (default `http://localhost:11434/v1`) and your **Model** name (e.g. `llama3.1`).
3. Click **Test connection** to verify Ollama is running, then **Save**.
4. Pull the model in your terminal first if needed: `ollama pull llama3.1`.

### 6. Reload the Website

Reload the webpage where you want to use PromptPen. The extension is now active on that site.

### 7. Select Text

Select any text on the page with your mouse. A floating toolbar icon appears near the selection.

### 8. Open Actions

Click the toolbar icon to open the full PromptPen action panel. You'll see all available actions grouped by category: Rewrite, Modify, Tone, Transform.

### 9. Choose an Action

Click any action — for example **Improve writing** or **Fix spelling and grammar**. PromptPen processes your selected text using the AI provider (cloud or local).

### 10. Review the Result

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
| Local AI | Transformers.js (`@huggingface/transformers`), ONNX Runtime Web |
| State | Zustand |
| Build | Vite, WXT module system |
| Linting | Biome, Ultracite |
| Runtime | MV3 (Chrome) / MV2 (Firefox) |

## Community

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
