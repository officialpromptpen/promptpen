import type { LucideIcon } from "lucide-react"

export type ProviderCategory = "cloud" | "openai-compatible" | "self-hosted"

export type AIProvider =
	| "anthropic"
	| "cohere"
	| "deepseek"
	| "gemini"
	| "groq"
	| "mistral"
	| "ollama"
	| "openai"
	| "openai-compatible"
	| "openrouter"
	| "together"
	| "transformers"

export type Theme = "dark" | "light" | "system"

export type ActionCategory = "modify" | "rewrite" | "tone" | "transform"

export interface Action {
	category: ActionCategory
	icon: LucideIcon
	id: string
	label: string
	prompt: string
}

export interface WebsiteRule {
	enabled: boolean
	hostname: string
	id: string
}
