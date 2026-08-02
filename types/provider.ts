import type { getProviderDefinition } from "@/features/providers/registry"
import type { AIProvider, ProviderCategory } from "./core"

export interface ProviderAdapter {
	model: string
	provider: AIProvider
	runPrompt: (input: string, systemPrompt?: string) => Promise<string>
}

export interface ConfiguredProviderDetail {
	label: string
	model: string
	provider: AIProvider
	updatedAt: number
}

export interface ProviderDefinition {
	category?: ProviderCategory
	defaultModel: string
	id: AIProvider
	label: string
}

export type ProviderEditorState = { hasApiKey: boolean; model: string }

export interface ProviderIconProps {
	className?: string
	provider: AIProvider
}

export interface ProviderRuntimeConfig {
	accessToken?: string
	apiKey: string
	baseUrl?: string
	model: string
	provider: AIProvider
}

export interface ProviderSummary {
	configuredProviders: AIProvider[]
	defaultModel: string
	defaultProvider: AIProvider
	unconfiguredProviders: AIProvider[]
}

export type ProviderTestResult = { message?: string; ok: boolean }

// Re-export for convenience
export type { getProviderDefinition }
