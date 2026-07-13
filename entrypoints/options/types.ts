import { Settings } from "lucide-react"
import type { AIProvider, Theme } from "@/types"

export type SectionId =
  | "general"
  | "ai-providers"
  | "models"
  | "writing"
  | "privacy"
  | "website-access"
  | "shortcuts"
  | "appearance"
  | "advanced"

export interface Section {
  id: SectionId
  label: string
  icon: typeof Settings
}

export interface OptionsSettings {
  language: string
  defaultProvider: AIProvider | null
  defaultModel: string | null
  streamingEnabled: boolean
  defaultTemperature: number
  defaultMaxTokens: number
  defaultTimeout: number
  theme: Theme
  fontSize: "small" | "medium" | "large"
  reducedMotion: boolean
  defaultWritingStyle: string
  quickActions: string[]
}

export interface CustomPrompt {
  id: string
  title: string
  content: string
  category: string
}

export interface ModelInfo {
  id: string
  name: string
  provider: AIProvider
  contextWindow: number
  inputPrice: number
  outputPrice: number
  supportsImages: boolean
  supportsReasoning: boolean
}
