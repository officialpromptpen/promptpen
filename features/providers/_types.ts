import type { LanguageModel } from "ai";
import type { AIProvider, ProviderCategory } from "@/types";

export interface ProviderModuleConfig {
  accessToken?: string;
  apiKey: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  model: string;
}

export interface ProviderModule {
  category: ProviderCategory;
  createModel: (config: ProviderModuleConfig) => LanguageModel;
  defaultModel: string;
  id: AIProvider;
  label: string;
}

export const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  cloud: "Cloud Providers",
  "openai-compatible": "OpenAI Compatible",
  "self-hosted": "Self-Hosted",
};

export type { ProviderCategory };
