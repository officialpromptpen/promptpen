import { Globe, Keyboard, Palette, Pen, Puzzle, Settings, Shield, Sparkles } from "lucide-react"
import type { Section, OptionsSettings } from "@/entrypoints/options/types"

export const SETTINGS_KEY = "promptpen.options.settings.v1"
export const SHORTCUTS_KEY = "promptpen.options.shortcuts.v1"
export const PROMPTS_KEY = "promptpen.options.prompts.v1"
export const OPTIONS_PAGE_TITLE = "PromptPen Settings | AI Writing Assistant"
export const OPTIONS_PAGE_DESCRIPTION =
  "Configure PromptPen providers, models, writing preferences, privacy controls, themes, and keyboard shortcuts."

export const sections: Section[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "ai-providers", label: "AI Providers", icon: Sparkles },
  { id: "writing", label: "Writing", icon: Pen },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "website-access", label: "Website Access", icon: Globe },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "advanced", label: "Advanced", icon: Puzzle },
]

export const defaultSettings: OptionsSettings = {
  defaultProvider: null,
  defaultModel: null,
  theme: "system",
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
  "toggle-toolbar": "Alt+T",
  "open-settings": "Alt+,",
  "process-grammar": "Alt+G",
  "process-rewrite": "Alt+R",
  "process-improve": "Alt+I",
  "process-summarize": "Alt+S",
  "process-professional": "Alt+Shift+P",
  "process-humanize": "Alt+H",
}

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
  { id: "toggle-toolbar", label: "Toggle Toolbar", category: "General" },
  { id: "open-settings", label: "Open Settings", category: "General" },
  { id: "process-grammar", label: "Fix Grammar", category: "Writing" },
  { id: "process-rewrite", label: "Rewrite", category: "Writing" },
  { id: "process-improve", label: "Improve", category: "Writing" },
  { id: "process-summarize", label: "Summarize", category: "Writing" },
  { id: "process-professional", label: "Professional", category: "Writing" },
  { id: "process-humanize", label: "Humanize", category: "Writing" },
]
