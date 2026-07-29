import type { LanguageModel } from "ai"
import type { AIProvider, ProviderCategory } from "@/types"

export interface ProviderModuleConfig {
  apiKey: string
  model: string
  baseUrl?: string
  headers?: Record<string, string>
  accessToken?: string
}

export interface ProviderModule {
  id: AIProvider
  label: string
  defaultModel: string
  category: ProviderCategory
  createModel: (config: ProviderModuleConfig) => LanguageModel
}

export const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  cloud: "Cloud Providers",
  "openai-compatible": "OpenAI Compatible",
  "self-hosted": "Self-Hosted",
}

export type { ProviderCategory }
