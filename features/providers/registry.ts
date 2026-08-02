import type { AIProvider, ProviderDefinition } from "@/types"
import type { ProviderModule } from "./_types"
export { CATEGORY_LABELS } from "./_types"
import { RECOMMENDED_MODELS } from "./transformers/recommended-models"

// Lightweight provider metadata — no SDK packages imported here.
const PROVIDER_META: ProviderDefinition[] = [
  { id: "openai", label: "OpenAI", defaultModel: "gpt-4o-mini", category: "cloud" },
  { id: "anthropic", label: "Anthropic", defaultModel: "claude-3-5-haiku-latest", category: "cloud" },
  { id: "gemini", label: "Gemini", defaultModel: "gemini-1.5-flash", category: "cloud" },
  { id: "groq", label: "Groq", defaultModel: "llama-3.1-8b-instant", category: "cloud" },
  { id: "deepseek", label: "DeepSeek", defaultModel: "deepseek-chat", category: "cloud" },
  { id: "mistral", label: "Mistral", defaultModel: "mistral-small-latest", category: "cloud" },
  { id: "cohere", label: "Cohere", defaultModel: "command-r-plus", category: "cloud" },
  { id: "openrouter", label: "OpenRouter", defaultModel: "openai/gpt-4o-mini", category: "openai-compatible" },
  { id: "together", label: "Together AI", defaultModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", category: "openai-compatible" },
  { id: "openai-compatible", label: "OpenAI Compatible", defaultModel: "gpt-4o-mini", category: "openai-compatible" },
  { id: "ollama", label: "Ollama", defaultModel: "llama3.1", category: "self-hosted" },
  { id: "transformers", label: "Transformers.js", defaultModel: RECOMMENDED_MODELS[0].modelId, category: "self-hosted" },
]

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = PROVIDER_META

export const DEFAULT_PROVIDER: AIProvider = "openai"

const moduleCache = new Map<string, ProviderModule>()

// Lazy-loaded provider modules — heavy SDK packages are only imported when
// the user actually runs an action, keeping the content script bundle small.
const PROVIDER_IMPORTS: Record<string, () => Promise<{ provider: ProviderModule }>> = {
  openai: () => import("./openai"),
  anthropic: () => import("./anthropic"),
  gemini: () => import("./gemini"),
  groq: () => import("./groq"),
  deepseek: () => import("./deepseek"),
  mistral: () => import("./mistral"),
  cohere: () => import("./cohere"),
  openrouter: () => import("./openrouter"),
  together: () => import("./together"),
  "openai-compatible": () => import("./openai-compatible"),
  ollama: () => import("./ollama"),
  transformers: () => import("./transformers"),
}

export function getProviderDefinition(provider: AIProvider): ProviderDefinition {
  return PROVIDER_DEFINITIONS.find((def) => def.id === provider) ?? PROVIDER_DEFINITIONS[0]
}

export async function getProviderModule(provider: AIProvider): Promise<ProviderModule> {
  const cached = moduleCache.get(provider)
  if (cached) return cached

  const importFn = PROVIDER_IMPORTS[provider]
  if (!importFn) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  const { provider: mod } = await importFn()
  moduleCache.set(provider, mod)
  return mod
}
