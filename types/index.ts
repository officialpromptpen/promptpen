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

export interface WebsiteRule {
  id: string
  hostname: string
  enabled: boolean
}
