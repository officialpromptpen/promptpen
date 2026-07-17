import type { Settings } from "lucide-react"
import type { AIProvider } from "@/types"

export type SectionId =
  | "general"
  | "ai-providers"
  | "custom-prompts"
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
}
