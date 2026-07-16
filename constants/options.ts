import { Globe, Palette, Puzzle, Settings, Sparkles } from "lucide-react"
import type { Section, OptionsSettings } from "@/entrypoints/options/types"

export const SETTINGS_KEY = "promptpen.options.settings.v1"
export const SHORTCUTS_KEY = "promptpen.options.shortcuts.v1"
export const OPTIONS_PAGE_TITLE = "PromptPen Settings | AI Writing Assistant"
export const OPTIONS_PAGE_DESCRIPTION =
  "Configure PromptPen providers, models, website access, themes, and advanced options."

export const sections: Section[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "ai-providers", label: "AI Providers", icon: Sparkles },
  { id: "website-access", label: "Website Access", icon: Globe },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "advanced", label: "Advanced", icon: Puzzle },
]

export const defaultSettings: OptionsSettings = {
  defaultProvider: null,
  defaultModel: null,
  theme: "system",
}

export const defaultShortcuts: Record<string, string> = {
  "toggle-toolbar": "Alt+T",
  "open-settings": "Alt+,",
  "process-grammar": "Alt+G",
  "process-rewrite": "Alt+R",
  "process-improve": "Alt+I",
  "process-summarize": "Alt+S",
  "process-professional": "Alt+Shift+P",
  "process-humanize": "Alt+H",
}
