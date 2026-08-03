import type { AIProvider } from "@/types";

export interface PopularModel {
  label: string;
  modelId: string;
  provider: AIProvider;
  providerLabel: string;
}

export const POPULAR_MODELS: PopularModel[] = [
  {
    label: "gpt-4o",
    modelId: "gpt-4o",
    provider: "openai",
    providerLabel: "OpenAI",
  },
  {
    label: "claude-3-sonnet",
    modelId: "claude-3-sonnet-20240229",
    provider: "anthropic",
    providerLabel: "Anthropic",
  },
  {
    label: "gemini-pro",
    modelId: "gemini-pro",
    provider: "gemini",
    providerLabel: "Google",
  },
];
