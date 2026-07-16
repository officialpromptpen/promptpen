import { Settings } from "lucide-react"
import type { AIProvider, Theme } from "@/types"

export type SectionId =
  | "general"
  | "ai-providers"
  | "website-access"
  | "appearance"
  | "advanced"

export interface Section {
  id: SectionId
  label: string
  icon: typeof Settings
}

export interface OptionsSettings {
  defaultProvider: AIProvider | null
  defaultModel: string | null
  theme: Theme
}
