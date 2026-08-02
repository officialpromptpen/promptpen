import type { AIProvider, ProviderDefinition } from "@/types";
import type { ProviderModule } from "./_types";

export { CATEGORY_LABELS } from "./_types";

import { RECOMMENDED_MODELS } from "./transformers/recommended-models";

// Lightweight provider metadata — no SDK packages imported here.
const PROVIDER_META: ProviderDefinition[] = [
  {
    category: "cloud",
    defaultModel: "gpt-4o-mini",
    id: "openai",
    label: "OpenAI",
  },
  {
    category: "cloud",
    defaultModel: "claude-3-5-haiku-latest",
    id: "anthropic",
    label: "Anthropic",
  },
  {
    category: "cloud",
    defaultModel: "gemini-1.5-flash",
    id: "gemini",
    label: "Gemini",
  },
  {
    category: "cloud",
    defaultModel: "llama-3.1-8b-instant",
    id: "groq",
    label: "Groq",
  },
  {
    category: "cloud",
    defaultModel: "deepseek-chat",
    id: "deepseek",
    label: "DeepSeek",
  },
  {
    category: "cloud",
    defaultModel: "mistral-small-latest",
    id: "mistral",
    label: "Mistral",
  },
  {
    category: "cloud",
    defaultModel: "command-r-plus",
    id: "cohere",
    label: "Cohere",
  },
  {
    category: "openai-compatible",
    defaultModel: "openai/gpt-4o-mini",
    id: "openrouter",
    label: "OpenRouter",
  },
  {
    category: "openai-compatible",
    defaultModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    id: "together",
    label: "Together AI",
  },
  {
    category: "openai-compatible",
    defaultModel: "gpt-4o-mini",
    id: "openai-compatible",
    label: "OpenAI Compatible",
  },
  {
    category: "self-hosted",
    defaultModel: "llama3.1",
    id: "ollama",
    label: "Ollama",
  },
  {
    category: "self-hosted",
    defaultModel: RECOMMENDED_MODELS[0].modelId,
    id: "transformers",
    label: "Transformers.js",
  },
];

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = PROVIDER_META;

export const DEFAULT_PROVIDER: AIProvider = "openai";

const moduleCache = new Map<string, ProviderModule>();

// Lazy-loaded provider modules — heavy SDK packages are only imported when
// the user actually runs an action, keeping the content script bundle small.
const PROVIDER_IMPORTS: Record<
  string,
  () => Promise<{ provider: ProviderModule }>
> = {
  anthropic: () => import("./anthropic"),
  cohere: () => import("./cohere"),
  deepseek: () => import("./deepseek"),
  gemini: () => import("./gemini"),
  groq: () => import("./groq"),
  mistral: () => import("./mistral"),
  ollama: () => import("./ollama"),
  openai: () => import("./openai"),
  "openai-compatible": () => import("./openai-compatible"),
  openrouter: () => import("./openrouter"),
  together: () => import("./together"),
  transformers: () => import("./transformers"),
};

export function getProviderDefinition(
  provider: AIProvider
): ProviderDefinition {
  return (
    PROVIDER_DEFINITIONS.find((def) => def.id === provider) ??
    PROVIDER_DEFINITIONS[0]
  );
}

export async function getProviderModule(
  provider: AIProvider
): Promise<ProviderModule> {
  const cached = moduleCache.get(provider);
  if (cached) {
    return cached;
  }

  const importFn = PROVIDER_IMPORTS[provider];
  if (!importFn) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const { provider: mod } = await importFn();
  moduleCache.set(provider, mod);
  return mod;
}
