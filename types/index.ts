export type Theme = "light" | "dark" | "system"

export type AIProvider =
  | "openrouter"
  | "openai"
  | "anthropic"
  | "gemini"
  | "groq"
  | "ollama"
  | "together"
  | "cohere"
  | "deepseek"
  | "mistral"
  | "openai-compatible"

export interface ProviderConfig {
  id: string
  name: string
  type: AIProvider
  apiKey: string
  baseUrl?: string
  isActive: boolean
  createdAt: number
}

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  contextWindow: number
  inputPrice: number
  outputPrice: number
  isFree: boolean
  isFavorited: boolean
}

export interface WebsiteRule {
  id: string
  hostname: string
  enabled: boolean
}

export interface Prompt {
  id: string
  title: string
  content: string
  isBuiltIn: boolean
  category?: string
  createdAt: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: number
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface AppSettings {
  theme: Theme
  defaultProvider: string
  defaultModel: string
  enableEverywhere: boolean
  websiteRules: WebsiteRule[]
  shortcuts: Record<string, string>
}
