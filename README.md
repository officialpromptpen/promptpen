# PromptPen

AI-powered writing assistant for Chrome and Firefox. Select text on any webpage and instantly improve, rewrite, or transform it with your preferred AI provider.

## Install on Browser

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/promptpen/gedjdledelhnidiajafkgpcakhabjmic)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox%20Add--ons-Install-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/promptpen)

## Key Capabilities & Features

- **Rewrite** — Improve writing, fix grammar, simplify language, or rewrite as a single sentence/paragraph
- **Tone adjustment** — 15+ tones: professional, casual, friendly, confident, thoughtful, optimistic, and more
- **Blog titles & SEO meta** — Generate 1 to 10 title ideas, SEO titles, 5 SEO meta descriptions (150-160 chars), SEO title & meta description pairs, catchy headlines, listicles, how-to, or question titles from selected text
- **Transform** — Convert text into bullet lists, numbered lists, or summaries
- **Modify** — Shorten, expand, summarize, or explain selected text
- **Custom prompts** — Create and save your own reusable writing prompts
- **Multi-provider** — Support for cloud AI, self-hosted LLMs, and local in-browser models
- **Local AI (Transformers.js [Beta])** — Run LLMs fully in-browser with ONNX Runtime WebAssembly, no API key or internet required after download
- **Local AI (Ollama)** — Connect to models running locally on your own machine
- **Website access control & 1-click suggested sites** — Enable/disable on specific domains with 1-click shortcuts for popular publishing sites (Medium, DEV Community, Hashnode, Substack, LinkedIn, GitHub, Notion, WordPress, Ghost, Reddit, X)
- **Security & Encryption** — AES-GCM encrypted API key storage, runtime background message origin validation (`sender.id === browser.runtime.id`), and Web Accessible WASM resources
- **Dark mode** — System-aware theming with manual override
- **Context menu & floating toolbar** — Select text or right-click to open contextual AI actions

## Supported Providers

OpenAI, OpenRouter, Anthropic, Gemini, Groq, Ollama (local), Together AI, Cohere, DeepSeek, Mistral, OpenAI Compatible, **Transformers.js (Beta - in-browser, offline)**.

## Prerequisites

- Node.js >= 20 (Node.js 24 LTS recommended)
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
   > "Refer to the README in the sources ZIP for WXT build instructions: run `pnpm install && pnpm run zip:firefox` to reproduce the build. Node.js 24+, pnpm required."
5. Select **Yes** when asked "Does your add-on contain minified or machine-generated code?"

## Usage Guide

### 1. Add an AI Provider

Open the extension settings (right-click the PromptPen icon → **Options** or **Dashboard**). Go to the **AI Providers** tab.

### 2. Select a Provider

Click on a provider from the list — for example, **OpenRouter**.

### 3. Add Model, API Key, Test, and Save

Enter your model name (e.g. `openai/gpt-4o-mini`) and your API key from OpenRouter. Click **Test Connection** to verify everything works, then click **Save**.

### 4. Use Local AI (Transformers.js - Beta)

Transformers.js runs models entirely in your browser — no API key, no account, and no data leaves your device.

1. Open the extension settings → **Self-Hosted** tab.
2. In the **Transformers.js (Beta)** card, pick a recommended model (e.g. `Qwen2.5-0.5B-Instruct`) or type any ONNX model ID from the [onnx-community](https://huggingface.co/onnx-community) organization.
3. Click **Add**, then **Download**. The model is downloaded from Hugging Face and cached locally with download progress shown.
4. For gated or private models, paste a **Hugging Face access token** and click **Save Token** first.

**Recommended models**

| Model | Parameters | Best for |
|---|---|---|
| [Qwen2.5-0.5B-Instruct-ONNX-MHA](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA) | 0.5B | Best overall — strong instruction following, grammar, and tone |
| [Qwen2.5-1.5B-Instruct](https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct) | 1.5B | Most capable for complex writing — needs ~4GB RAM, longer download |
| [SmolLM2-360M-Instruct-ONNX](https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX) | 360M | Lightweight and fast, decent quality for short text |
| [SmolLM2-135M-Instruct-ONNX-MHA](https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA) | 135M | Fastest fallback for simple rewrites |

> **Requirements:** WebAssembly (SIMD recommended), at least 2 CPU cores, and 2GB+ RAM minimum. For **fast results**, use a machine with **8GB+ RAM**. The Options page checks your system and warns you if it can't run local models.
>
> **Tips:** Stick to models under 3B parameters for good in-browser speed. Only models with pre-converted ONNX weights work — browse [onnx-community](https://huggingface.co/onnx-community) for compatible ones. Gated models (e.g. Llama 3) need a Hugging Face access token.

### 5. Use Local AI (Ollama)

If you run [Ollama](https://ollama.com) on your machine, connect it directly:

1. Open the extension settings → **Self-Hosted** tab.
2. In the **Ollama** card, set the **Base URL** (default `http://localhost:11434/v1`) and your **Model** name (e.g. `llama3.1`).
3. Click **Test connection** to verify Ollama is running, then **Save**.
4. Pull the model in your terminal first if needed: `ollama pull llama3.1`.

### 6. Website Access & Quick-Add Shortcuts

Control where PromptPen runs under **Options > Website Access**. Use 1-click quick-add buttons to enable popular publishing platforms such as Medium, DEV Community, Hashnode, Substack, LinkedIn, GitHub, Notion, WordPress, Ghost, Reddit, and X.

### 7. Select Text & Execute Actions

Select any text on a webpage or input field. The floating toolbar appears near the selection with options to rewrite, improve, explain, or replace text directly.

## Quality & Security Audits

```bash
pnpm run compile     # TypeScript type safety check (tsc --noEmit)
pnpm run check       # Biome & Ultracite code formatting and linting
pnpm run doctor      # React Doctor performance, accessibility & architectural audit
```

## Recent Improvements & Changelog Highlights

- **1-Click Website Access Suggestions**: Added quick-add shortcuts for popular blogging & writing platforms (Medium, DEV, Hashnode, Substack, LinkedIn, GitHub, Notion, WordPress, Ghost, Reddit, X).
- **Extension Security Hardening**:
  - Implemented background listener message origin validation (`sender.id === browser.runtime.id`).
  - Strict AES-GCM API key encryption in `@wxt-dev/storage`.
  - Full Chrome Web Store MV3 and Firefox Extension Workshop security compliance.
- **WASM & Local AI Optimization**:
  - Properly configured WebAssembly ONNX runtime assets (`ort-wasm-simd-threaded.asyncify.wasm`, etc.) with `web_accessible_resources` and `browser.runtime.getURL("/onnx/")` dynamic loading.
- **React Diagnostics & Performance**:
  - Improved React Doctor score to **86/100 (Great)** with **0 errors**.
  - Optimized async state management with `Promise.all()` parallelization and mounted flag safeguards.
  - Added accessible `aria-label` controls for UI components.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [WXT](https://wxt.dev) (browser extension framework) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4, Shadcn UI |
| Animation | Framer Motion |
| Icons | Lucide React |
| AI SDK | Vercel AI SDK (`ai`) |
| Local AI | Transformers.js (Beta) (`@huggingface/transformers`), ONNX Runtime WebAssembly |
| State | Zustand |
| Build | Vite, WXT module system |
| Code Quality | Biome, Ultracite, React Doctor |
| Runtime | MV3 (Chrome) / MV2 & MV3 (Firefox) |

## Community

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
