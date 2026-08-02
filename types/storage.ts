import type { WebsiteRule } from "./core"

export interface CustomPromptDefinition {
	id: string
	prompt: string
	title: string
	updatedAt: number
}

export interface WebsiteAccessState {
	enableEverywhere: boolean
	excludedHostnames: string[]
	websiteRules: WebsiteRule[]
}
