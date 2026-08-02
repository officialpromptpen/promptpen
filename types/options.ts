import type { Settings } from "lucide-react"
import type { AIProvider } from "./core"
import type { ConfiguredProviderDetail, ProviderSummary } from "./provider"
import type { CustomPromptDefinition } from "./storage"

export type SectionId =
	| "advanced"
	| "ai-providers"
	| "appearance"
	| "custom-prompts"
	| "general"
	| "self-hosted"
	| "website-access"

export interface Section {
	icon: typeof Settings
	id: SectionId
	label: string
}

export interface OptionsSettings {
	defaultModel: string | null
	defaultProvider: AIProvider | null
}

export interface OptionsState {
	activeSection: SectionId
	apiKey: string
	configuredProviderDetails: ConfiguredProviderDetail[]
	connectionVerified: boolean
	customPrompts: CustomPromptDefinition[]
	exportSettings: () => void
	handleDeleteCustomPrompt: (promptId: string) => Promise<void>
	handleDeleteProvider: (provider: AIProvider) => Promise<void>
	handleEditProvider: (provider: AIProvider) => void
	handleSaveCustomPrompt: (
		title: string,
		prompt: string,
		promptId?: string,
	) => Promise<void>
	handleSaveProvider: () => Promise<void>
	handleTestProvider: () => Promise<void>
	hasStoredApiKey: boolean
	isSavingProvider: boolean
	isTestingProvider: boolean
	loaded: boolean
	providerModel: string
	providerStatusMessage: string
	providerStatusType: "error" | "idle" | "success"
	providerSummary: ProviderSummary | null
	resetAllData: () => void
	selectedProvider: AIProvider
	selectedProviderDefinition: ReturnType<typeof import("@/features/providers/registry").getProviderDefinition>
	selectProvider: (provider: AIProvider) => void
	setActiveSection: (id: SectionId) => void
	setApiKey: React.Dispatch<React.SetStateAction<string>>
	setProviderModel: React.Dispatch<React.SetStateAction<string>>
	setSelectedProvider: React.Dispatch<React.SetStateAction<AIProvider>>
	setSettings: React.Dispatch<React.SetStateAction<OptionsSettings>>
	settings: OptionsSettings
	unconfiguredProviders: number
}

export interface AddFormProps {
	description: string
	icon: React.ReactNode
	id: string
	label: string
	onAdd: () => void
	onChange: (value: string) => void
	placeholder: string
	preview: string[]
	value: string
}

export interface WebsiteListSectionProps {
	deleteConfirm: string | null
	emptyDescription: string
	emptyTitle: string
	icon: React.ReactNode
	items: string[]
	onCancelDelete: () => void
	onDeleteConfirm: (hostname: string | null) => void
	onRemove: (hostname: string) => void
	title: string
}

export interface WebsiteAccessStateParam {
	websiteRules: { enabled: boolean; hostname: string }[]
}
