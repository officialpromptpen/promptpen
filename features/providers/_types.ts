import type { LanguageModel } from "ai"
import type { AIProvider } from "@/types"

export interface ProviderModuleConfig {
  apiKey: string
  model: string
  baseUrl?: string
  headers?: Record<string, string>
}

export interface ProviderModule {
  id: AIProvider
  label: string
  defaultModel: string
  createModel: (config: ProviderModuleConfig) => LanguageModel
}
