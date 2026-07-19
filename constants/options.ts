import { Globe, Palette, Puzzle, Settings, Sparkles, FilePenLine } from "lucide-react"
import type { Section, OptionsSettings } from "@/types"

export const SETTINGS_KEY = "promptpen.options.settings.v1"
export const OPTIONS_PAGE_TITLE = "PromptPen Settings | AI Writing Assistant"
export const OPTIONS_PAGE_DESCRIPTION =
  "Configure PromptPen providers, models, website access, themes, and advanced options."

export const sections: Section[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "ai-providers", label: "AI Providers", icon: Sparkles },
  { id: "custom-prompts", label: "Custom Prompts", icon: FilePenLine },
  { id: "website-access", label: "Website Access", icon: Globe },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "advanced", label: "Advanced", icon: Puzzle },
]

export const defaultSettings: OptionsSettings = {
  defaultProvider: null,
  defaultModel: null,
}
