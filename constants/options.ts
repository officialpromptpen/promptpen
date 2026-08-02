import {
  FilePenLine,
  Globe,
  Palette,
  Puzzle,
  Server,
  Settings,
  Sparkles,
} from "lucide-react";
import type { OptionsSettings, Section } from "@/types";

export const SETTINGS_KEY = "promptpen.options.settings.v1";
export const OPTIONS_PAGE_TITLE = "PromptPen Settings | AI Writing Assistant";
export const OPTIONS_PAGE_DESCRIPTION =
  "Configure PromptPen providers, models, website access, themes, and advanced options.";

export const sections: Section[] = [
  { icon: Settings, id: "general", label: "General" },
  { icon: Sparkles, id: "ai-providers", label: "AI Providers" },
  { icon: Server, id: "self-hosted", label: "Self-Hosted" },
  { icon: FilePenLine, id: "custom-prompts", label: "Custom Prompts" },
  { icon: Globe, id: "website-access", label: "Website Access" },
  { icon: Palette, id: "appearance", label: "Appearance" },
  { icon: Puzzle, id: "advanced", label: "Advanced" },
];

export const defaultSettings: OptionsSettings = {
  defaultModel: null,
  defaultProvider: null,
};
