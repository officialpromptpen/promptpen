import {
  Cpu,
  Globe,
  Keyboard,
  Palette,
  Pen,
  Puzzle,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react"
import { PROVIDER_DEFINITIONS } from "@/features/providers/catalog"
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

export const sections: Section[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "ai-providers", label: "AI Providers", icon: Sparkles },
  { id: "models", label: "Models", icon: Cpu },
  { id: "writing", label: "Writing", icon: Pen },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "website-access", label: "Website Access", icon: Globe },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "advanced", label: "Advanced", icon: Puzzle },
]

export interface OptionsSettings {
  language: string
  defaultProvider: AIProvider | null
  defaultModel: string | null
  streamingEnabled: boolean
  defaultTemperature: number
  defaultMaxTokens: number
  defaultTimeout: number
  autoSuggest: boolean
  excludedSites: string[]
  privacyMode: boolean
  theme: Theme
  fontSize: "small" | "medium" | "large"
  reducedMotion: boolean
  sidebarEnabled: boolean
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

export const SETTINGS_KEY = "promptpen.options.settings.v1"
export const SHORTCUTS_KEY = "promptpen.options.shortcuts.v1"
export const PROMPTS_KEY = "promptpen.options.prompts.v1"
export const OPTIONS_PAGE_TITLE = "PromptPen Settings | AI Writing Assistant"
export const OPTIONS_PAGE_DESCRIPTION =
  "Configure PromptPen providers, models, writing preferences, privacy controls, themes, and keyboard shortcuts."

export const defaultSettings: OptionsSettings = {
  language: "en",
  defaultProvider: null,
  defaultModel: null,
  streamingEnabled: true,
  defaultTemperature: 0.7,
  defaultMaxTokens: 4096,
  defaultTimeout: 30000,
  autoSuggest: true,
  excludedSites: [],
  privacyMode: false,
  theme: "system",
  fontSize: "medium",
  reducedMotion: false,
  sidebarEnabled: true,
  defaultWritingStyle: "improve",
  quickActions: [
    "grammar",
    "rewrite",
    "improve",
    "professional",
    "friendly",
    "summarize",
    "explain",
    "continue",
    "humanize",
    "casual",
    "formal",
    "creative",
  ],
}

export const defaultShortcuts: Record<string, string> = {
  "toggle-sidebar": "Alt+P",
  "toggle-toolbar": "Alt+T",
  "open-settings": "Alt+,",
  "process-grammar": "Alt+G",
  "process-rewrite": "Alt+R",
  "process-improve": "Alt+I",
  "process-summarize": "Alt+S",
  "process-professional": "Alt+Shift+P",
  "process-humanize": "Alt+H",
  "focus-input": "Alt+L",
  "send-message": "Enter",
}

export const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
]

export const writingStyles = [
  { value: "grammar", label: "Grammar" },
  { value: "rewrite", label: "Rewrite" },
  { value: "improve", label: "Improve" },
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "academic", label: "Academic" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "creative", label: "Creative" },
  { value: "summarize", label: "Summarize" },
  { value: "explain", label: "Explain" },
  { value: "continue", label: "Continue" },
]

export const quickActions = [
  { id: "grammar", label: "Grammar" },
  { id: "rewrite", label: "Rewrite" },
  { id: "improve", label: "Improve" },
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "summarize", label: "Summarize" },
  { id: "explain", label: "Explain" },
  { id: "continue", label: "Continue" },
  { id: "humanize", label: "Humanize" },
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "creative", label: "Creative" },
]

export const shortcutRows = [
  { id: "toggle-sidebar", label: "Toggle Sidebar", category: "General" },
  { id: "toggle-toolbar", label: "Toggle Toolbar", category: "General" },
  { id: "open-settings", label: "Open Settings", category: "General" },
  { id: "process-grammar", label: "Fix Grammar", category: "Writing" },
  { id: "process-rewrite", label: "Rewrite", category: "Writing" },
  { id: "process-improve", label: "Improve", category: "Writing" },
  { id: "process-summarize", label: "Summarize", category: "Writing" },
  { id: "process-professional", label: "Professional", category: "Writing" },
  { id: "process-humanize", label: "Humanize", category: "Writing" },
  { id: "focus-input", label: "Focus Input", category: "Sidebar" },
  { id: "send-message", label: "Send Message", category: "Sidebar" },
]

export function formatContext(value: number): string {
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`
  }
  return `${value}`
}

export function formatPrice(value: number): string {
  if (value === 0) {
    return "Free"
  }
  return `$${value.toFixed(2)}/M`
}

export function generateModelList(): ModelInfo[] {
  return PROVIDER_DEFINITIONS.flatMap((provider) => {
    const primary: ModelInfo = {
      id: provider.defaultModel,
      name: provider.defaultModel,
      provider: provider.id,
      contextWindow: provider.id === "ollama" ? 8192 : 128000,
      inputPrice: provider.id === "ollama" ? 0 : 0.5,
      outputPrice: provider.id === "ollama" ? 0 : 1,
      supportsImages: provider.id !== "ollama",
      supportsReasoning: provider.id === "openai" || provider.id === "anthropic",
    }

    const fastVariant: ModelInfo = {
      id: `${provider.defaultModel}-fast`,
      name: `${provider.label} Fast`,
      provider: provider.id,
      contextWindow: 32000,
      inputPrice: provider.id === "ollama" ? 0 : 0.2,
      outputPrice: provider.id === "ollama" ? 0 : 0.4,
      supportsImages: false,
      supportsReasoning: false,
    }

    return [primary, fastVariant]
  })
}
