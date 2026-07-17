import type { AIProvider, ProviderDefinition } from "@/types"

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  { id: "openai", label: "OpenAI", defaultModel: "gpt-4o-mini" },
  {
    id: "openrouter",
    label: "OpenRouter",
    defaultModel: "openai/gpt-4o-mini",
    baseUrl: "https://openrouter.ai/api/v1",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    defaultModel: "claude-3-5-haiku-latest",
    baseUrl: "https://api.anthropic.com/v1",
  },
  {
    id: "gemini",
    label: "Gemini",
    defaultModel: "gemini-1.5-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
  },
  {
    id: "groq",
    label: "Groq",
    defaultModel: "llama-3.1-8b-instant",
    baseUrl: "https://api.groq.com/openai/v1",
  },
  { id: "ollama", label: "Ollama", defaultModel: "llama3.1", baseUrl: "http://localhost:11434/v1" },
  {
    id: "together",
    label: "Together AI",
    defaultModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    baseUrl: "https://api.together.xyz/v1",
  },
  {
    id: "cohere",
    label: "Cohere",
    defaultModel: "command-r-plus",
    baseUrl: "https://api.cohere.ai/compatibility/v1",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    defaultModel: "deepseek-chat",
    baseUrl: "https://api.deepseek.com/v1",
  },
  {
    id: "mistral",
    label: "Mistral",
    defaultModel: "mistral-small-latest",
    baseUrl: "https://api.mistral.ai/v1",
  },
  {
    id: "openai-compatible",
    label: "OpenAI Compatible",
    defaultModel: "gpt-4o-mini",
  },
]

export const DEFAULT_PROVIDER: AIProvider = "openai"

const providerLookup = new Map(PROVIDER_DEFINITIONS.map((provider) => [provider.id, provider]))

function getFallbackProvider(): ProviderDefinition {
  const defaultProvider = PROVIDER_DEFINITIONS.find((provider) => provider.id === DEFAULT_PROVIDER)
  if (defaultProvider) {
    return defaultProvider
  }

  const firstProvider = PROVIDER_DEFINITIONS[0]
  if (firstProvider) {
    return firstProvider
  }

  throw new Error("Provider catalog must define at least one provider.")
}

const fallbackProvider = getFallbackProvider()

export function getProviderDefinition(provider: AIProvider): ProviderDefinition {
  return providerLookup.get(provider) ?? fallbackProvider
}
