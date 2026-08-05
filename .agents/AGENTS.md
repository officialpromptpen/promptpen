# Project Memory & Architectural Overview: PromptPen

## Overview & Purpose
**PromptPen** is a cross-browser (Chrome MV3 & Firefox MV2/MV3) AI writing assistant extension built with **WXT**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. It enables users to select text on any webpage or input field (`input`, `textarea`, `contenteditable`) and transform it using cloud LLMs or fully in-browser local AI models.

## Main Capabilities
- **Text Rewrite & Modification**: Fix spelling/grammar, improve clarity, simplify, shorten, expand, summarize, rewrite as single sentence/paragraph, continue writing.
- **Blog Actions & Meta Generation**: Generate 1, 3, 5, or 10 titles, SEO titles, catchy/clickbait headlines, listicles, how-to, question titles, 5 SEO meta descriptions (150-160 chars), and SEO title & meta description pairs from headings.
- **Tone Adjustment**: 15+ built-in tones (professional, casual, friendly, confident, direct, etc.).
- **Format Transformation**: Convert text into bulleted or numbered lists.
- **Custom Prompts**: Save and execute user-defined prompt templates.
- **Multi-Provider Support**:
  - Cloud: OpenAI, Anthropic, Gemini, Groq, DeepSeek, Mistral, Cohere.
  - OpenAI-compatible: OpenRouter, Together AI, custom endpoints.
  - Self-hosted / Local: Ollama (local API) & Transformers.js (in-browser ONNX WebAssembly execution, zero-API key, fully offline).
- **Security & Storage**: AES-GCM encrypted API keys and tokens in extension storage (`@wxt-dev/storage`).
- **Site Controls**: Domain access control (enable/disable on specific hostnames).

## Codebase Architecture & Structure

```
.
├── entrypoints/          # WXT Extension Entrypoints
│   ├── background.ts    # Service worker (handles RUN_PROMPT messaging & provider execution)
│   ├── content.tsx       # Content script (selection listener, isolated Shadow DOM UI mount)
│   ├── options/         # Full-page options/dashboard app (provider setup, models, rules)
│   └── popup/           # Extension toolbar popup interface
├── features/            # Feature-driven modular architecture
│   ├── providers/       # AI provider registry, dynamic module loading, SDK adapters, AES storage
│   ├── toolbar/         # Contextual floating toolbar UI, action panel, prompt execution logic
│   ├── storage/         # Theme sync, domain access control utilities
│   ├── onboarding/      # First-run onboarding flow
│   └── theme/           # Dark/light mode theme utilities
├── stores/              # Zustand state stores (e.g. toolbar.ts)
├── constants/           # Action definitions (actions.ts), options config, provider defaults
├── types/               # TypeScript domain interfaces (provider, toolbar, storage, options)
├── lib/                 # Core utilities (cn, helper functions)
├── wxt.config.ts        # WXT framework configuration (manifest permissions, web resources)
└── package.json         # Package scripts & dependencies (pnpm managed)
```

## How It Works Under the Hood

1. **Selection Detection & Floating UI (`entrypoints/content.tsx`)**:
   - Listens to `mouseup`, `keyup`, and `selectionchange` events on text fields and document selections.
   - Creates a closed Shadow DOM (`createShadowRootUi`) styled with Tailwind CSS to isolate styles from target websites.
   - Computes selection bounding rect (`DOMRect`) and displays `ContextualToolbar` near the selection.

2. **Action Execution (`features/toolbar/action-handlers.ts`)**:
   - User picks an action (e.g., "Improve writing").
   - Action prompt is synthesized via `createActionPrompt` and sent to `background.ts` using `browser.runtime.sendMessage({ type: "RUN_PROMPT", ... })`.

3. **Background & Provider Execution (`entrypoints/background.ts` & `features/providers/`)**:
   - `background.ts` receives `RUN_PROMPT`.
   - Loads runtime provider configuration and decrypts API key (`storage.ts` using AES-GCM via Web Crypto API).
   - Lazily imports provider modules (`registry.ts` uses `import()` dynamic imports to keep content script bundle light).
   - Wraps model instance with Vercel AI SDK (`ai` package `generateText`).
   - Executes prompt and returns result string to content script.

4. **Result Placement (`features/toolbar/`)**:
   - Content script receives AI response.
   - User can either click **Copy** (to clipboard) or **Replace** (replaces selected range in DOM / text field).

## Key Developer Commands
- Package Manager: `pnpm`
- Dev Mode (Chrome): `pnpm run dev`
- Dev Mode (Firefox): `pnpm run dev:firefox`
- Build: `pnpm run build`
- Type Check: `pnpm run compile`
- Lint: `pnpm run check` / `pnpm run doctor`
