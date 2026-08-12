import type { getProviderDefinition } from "@/features/providers/registry";
import type { AIProvider, ProviderCategory } from "./core";
import type { WritingOutput } from "./writing";

export interface ProviderAdapter {
  model: string;
  provider: AIProvider;
  runPrompt: (
    input: string,
    systemPrompt?: string,
    abortSignal?: AbortSignal
  ) => Promise<string>;
  runWritingAction?: (
    action: string,
    text: string,
    targetLanguage?: string,
    abortSignal?: AbortSignal
  ) => Promise<WritingOutput>;
}


export type ConnectionStatus = "connected" | "error" | "inactive";

export interface ConfiguredProviderDetail {
  id: string;
  label: string;
  model: string;
  models?: string[];
  provider: AIProvider;
  status: ConnectionStatus;
  updatedAt: number;
}

export interface ProviderDefinition {
  category?: ProviderCategory;
  defaultModel: string;
  id: AIProvider;
  label: string;
}

export type ProviderEditorState = {
  hasApiKey: boolean;
  model: string;
  models?: string[];
};

export interface ProviderIconProps {
  className?: string;
  provider: AIProvider;
}

export interface ProviderRuntimeConfig {
  accessToken?: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  provider: AIProvider;
}

export interface ProviderSummary {
  configuredProviders: AIProvider[];
  defaultModel: string;
  defaultProvider: AIProvider;
  unconfiguredProviders: AIProvider[];
}

export type ProviderTestResult = { message?: string; ok: boolean };

// Re-export for convenience
export type { getProviderDefinition };
