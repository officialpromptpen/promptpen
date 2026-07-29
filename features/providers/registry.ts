import type { AIProvider, ProviderDefinition } from "@/types"
import type { ProviderModule } from "./_types"
import { provider as openai } from "./openai"
import { provider as anthropic } from "./anthropic"
import { provider as gemini } from "./gemini"
import { provider as groq } from "./groq"
import { provider as deepseek } from "./deepseek"
import { provider as mistral } from "./mistral"
import { provider as cohere } from "./cohere"
import { provider as openrouter } from "./openrouter"
import { provider as ollama } from "./ollama"
import { provider as together } from "./together"
import { provider as openaiCompatible } from "./openai-compatible"

const PROVIDER_MODULES: ProviderModule[] = [
  openai,
  anthropic,
  gemini,
  groq,
  deepseek,
  mistral,
  cohere,
  openrouter,
  ollama,
  together,
  openaiCompatible,
]

const moduleMap = new Map<string, ProviderModule>(
  PROVIDER_MODULES.map((mod) => [mod.id, mod]),
)

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = PROVIDER_MODULES.map((mod) => ({
  id: mod.id,
  label: mod.label,
  defaultModel: mod.defaultModel,
}))

export const DEFAULT_PROVIDER: AIProvider = "openai"

export function getProviderDefinition(provider: AIProvider): ProviderDefinition {
  const mod = moduleMap.get(provider)
  if (mod) {
    return { id: mod.id, label: mod.label, defaultModel: mod.defaultModel }
  }

  const firstProvider = PROVIDER_MODULES[0]
  if (firstProvider) {
    return { id: firstProvider.id, label: firstProvider.label, defaultModel: firstProvider.defaultModel }
  }

  throw new Error("Provider registry must define at least one provider.")
}

export function getProviderModule(provider: AIProvider): ProviderModule {
  const mod = moduleMap.get(provider)
  if (mod) {
    return mod
  }

  const fallback = PROVIDER_MODULES[0]
  if (fallback) {
    return fallback
  }

  throw new Error("Provider registry must define at least one provider.")
}
