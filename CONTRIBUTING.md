# Contributing to PromptPen

Thank you for your interest! This guide covers everything you need to contribute effectively.

## Project Overview

PromptPen is an AI-powered browser extension built with [WXT](https://wxt.dev). It lets users select text on any webpage and apply AI-powered writing actions — rewriting, tone adjustment, transformation, and more — through any OpenAI-compatible provider.

## Quick Start

```bash
pnpm install
pnpm postinstall
pnpm run dev          # Chrome
pnpm run dev:firefox  # Firefox
```

## Project Structure

```
entrypoints/
├── background.ts        # Service worker (WXT entrypoint)
├── content.tsx          # Content script injected into pages
├── options/             # Options page (settings UI)
│   ├── App.tsx
│   ├── hooks/
│   │   └── use-options-state.ts
│   └── sections/        # Settings page sections
│       ├── advanced.tsx
│       ├── ai-providers.tsx
│       ├── appearance.tsx
│       ├── custom-prompts.tsx
│       ├── general.tsx
│       └── website-access.tsx
└── popup/               # Popup UI
    ├── App.tsx
    ├── main.tsx
    └── status-card.tsx

features/
├── providers/           # AI provider integration
│   ├── catalog.ts       # Provider definitions & metadata
│   ├── provider-icons.tsx
│   ├── sdk.ts           # Provider adapter & API calls
│   └── storage.ts       # Provider config persistence
├── storage/             # Storage layer
│   ├── bridge.ts        # EventTarget bridge for browser.storage
│   ├── custom-prompts.ts
│   └── website-access.ts
├── theme/               # Theming
│   ├── init-theme.ts
│   ├── hooks/use-theme.ts
│   └── theme-selector.tsx
└── toolbar/             # Toolbar UI
    └── toolbar-actions.tsx

components/
├── contextual-toolbar.tsx  # Main toolbar component
├── layout.tsx
├── Logo.tsx
├── navigation.tsx
└── ui/                     # Base UI components (shadcn-style)
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── scroll-area.tsx
    ├── separator.tsx
    └── tooltip.tsx

types/index.ts           # All shared type definitions
constants/
├── actions.ts           # Writing action definitions
└── options.ts           # Settings page constants
stores/toolbar.ts        # Zustand store
public/                  # Static assets
```

## Code Standards

This project uses **Ultracite** (powered by Biome) for formatting and linting.

```bash
# Format and fix all files
npm exec -- ultracite fix

# Check for issues
npm exec -- ultracite check
```

Key rules from the codebase conventions:

- **Type safety**: Use explicit types for parameters and return values. Prefer `unknown` over `any`. No type assertions when narrowing works.
- **Naming**: Exported interfaces don't use `I` prefixes. Use descriptive names. Extract magic numbers into named constants.
- **Imports**: All shared types come from `@/types`. Never define the same type inline in multiple files.
- **React**: Function components only. Hooks at top level. Proper dependency arrays. No components defined inside other components.
- **Async**: Always `await` promises in async functions. Use `async/await` over `.then()`. Handle errors with try-catch.
- **No debug code**: Remove `console.log`, `debugger`, and `alert` before committing.
- **No emojis in code**: Only use emojis if explicitly asked by the user.

## TypeScript

```bash
pnpm run compile  # npx tsc --noEmit
```

Run this before pushing. Zero errors required.

## React Doctor

```bash
pnpm run doctor
```

This project targets a 100/100 score from `react-doctor`. The CI workflow (`.github/workflows/react-doctor.yml`) runs it on every push. Key rules enforced:

- All `useEffect` hooks must have proper cleanup via `addEventListener`/`removeEventListener`
- No giant components (>300 lines)
- No unused exports
- No combined iterations (`.map().filter()` → `for...of`)

## Adding a New Writing Action

1. Open `constants/actions.ts`
2. Add a new entry to the `actions` array:

```ts
{
  id: "my-action",
  label: "My Action",
  category: "rewrite", // "rewrite" | "modify" | "tone" | "transform"
  prompt: "Instruction for the AI describing what to do.",
  icon: Sparkles, // Any lucide-react icon
}
```

3. Import the icon from `lucide-react`
4. Run the type check — `ActionCategory` in `types/index.ts` already covers the 4 categories; if you need a new category, add it there

## Adding a New AI Provider

1. Open `features/providers/catalog.ts`
2. Add an entry to `PROVIDER_DEFINITIONS`:

```ts
{ id: "my-provider", label: "My Provider", defaultModel: "model-name", baseUrl: "https://api.example.com/v1" }
```

3. Add the provider ID to the `AIProvider` union type in `types/index.ts`
4. Add the provider to the `chatCompletionsProviders` Set in `features/providers/sdk.ts` (if it supports chat completions via OpenAI-compatible API)
5. Add a brand icon mapping in `features/providers/provider-icons.tsx`
6. Runtime config vars (API key env name, etc.) go in `features/providers/storage.ts`

## Theming

- Tailwind CSS 4 uses `prefix(pp)` — all utilities are `pp:bg-background`, `pp:text-foreground`, etc.
- Dark mode uses the `.pp-dark` class on the root element.
- CSS variables for dark mode are set on `.pp-dark, .dark` globally.
- Floating UI portal targets `#pp:root` to inherit dark variables.
- The `Theme` type (`"light" | "dark" | "system"`) is in `@/types`.

## Browser Storage

- All storage keys use the `promptpen.` prefix.
- The `features/storage/bridge.ts` module wraps `browser.storage.onChanged` as a DOM `EventTarget` for React Doctor compliance.
- Storage is handled through `@wxt-dev/storage`.

## Git Workflow

```bash
# Create a branch
git checkout -b feat/my-feature

# Make changes, then verify
pnpm run compile
npm exec -- ultracite fix

# Commit (use conventional commits)
git commit -m "feat: add my feature"

# Push and open a PR
git push -u origin feat/my-feature
```

## Pull Request Process

1. Run `pnpm run compile` and `npm exec -- ultracite check` — zero errors required
2. Keep PRs focused on a single concern
3. Update `README.md` if adding user-facing features
4. The `react-doctor.yml` CI workflow will run automatically
5. Maintain the 100/100 React Doctor score
