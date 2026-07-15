import {
type LucideIcon
} from "lucide-react"

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


export interface Action {
  id: string
  label: string
  icon: LucideIcon
}

export interface ToolbarActionsProps {
  onAction: (actionId: string) => void
  isLoading?: boolean
  activeActionId?: string | null
  enabledActionIds?: string[]
  defaultActionId?: string | null
}