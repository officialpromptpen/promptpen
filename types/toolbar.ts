import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import type { Action, ActionCategory, AIProvider } from "./core"
import type { CustomPromptDefinition } from "./storage"

export type ToolbarCategory = "all" | ActionCategory | "custom-prompt"

export interface ToolbarPosition {
	visible: boolean
	x: number
	y: number
}

export type ToolbarAction =
	| { type: "ACTION_ERROR"; error: string }
	| { type: "ACTION_SUCCESS"; text: string }
	| { type: "COPY_RESET" }
	| { type: "COPIED" }
	| { type: "HIDE_TOOLBAR_IF_VISIBLE" }
	| { type: "RESET" }
	| { type: "RUN_ACTION"; actionId: string }
	| { type: "SELECTION_CHANGED"; text: string; position: ToolbarPosition }

export interface ToolbarState {
	activeActionId: string | null
	copied: boolean
	errorText: string
	isRunning: boolean
	lastActionId: string | null
	processedText: string
	selectedText: string
	showResult: boolean
	toolbarPos: ToolbarPosition
}

export interface ToolbarActionsProps {
	activeActionId?: string | null
	configuredProviderModels?: Partial<Record<AIProvider, string>>
	configuredProviders?: AIProvider[]
	enabledActionIds?: string[]
	isLoading?: boolean
	onAction: (actionId: string) => void
	onModelChange: (model: string) => void
	onProviderChange: (provider: AIProvider) => void
	onRunCustomPrompt: (prompt: string) => void
	selectedModel: string
	selectedProvider: AIProvider
}

export interface ToolbarPopoverProps {
	activeActionId: string | null
	configuredProviderModels: Partial<Record<AIProvider, string>>
	configuredProviders: AIProvider[]
	isRunning: boolean
	onAction: (actionId: string) => void
	onModelChange: (model: string) => void
	onProviderChange: (provider: AIProvider) => void
	onRunCustomPrompt: (prompt: string) => void
	portalNode: HTMLElement | null
	selectedModel: string
	selectedProvider: AIProvider
	toolbarPos: ToolbarPosition
	visible: boolean
}

export interface CategoryFilterBarProps {
	activeCategory: ToolbarCategory
	categories: { id: ToolbarCategory; label: string }[]
	onCategoryChange: (category: ToolbarCategory) => void
}

export interface ActionGroupListProps {
	activeActionId: string | null
	groupedActions: { category: ActionCategory; items: Action[] }[]
	isLoading: boolean
	onAction: (actionId: string) => void
	onKeyDown: (event: ReactKeyboardEvent, actionId: string) => void
}

export interface ClosedToolbarStateProps {
	onOpen: () => void
}

export interface CustomPromptListProps {
	isLoading: boolean
	onRun: (prompt: CustomPromptDefinition) => void
	prompts: CustomPromptDefinition[]
}

export interface ResultActionsProps {
	copied: boolean
	errorText: string
	isRunning: boolean
	lastActionId: string | null
	onClose: () => void
	onCopy: () => void
	onReplace: () => void
	onRerun: () => void
	processedText: string
	selectedText: string
}

export interface ResultBodyProps {
	activeActionId: string | null
	errorText: string
	isRunning: boolean
	processedText: string
}

export interface ResultDialogProps {
	activeActionId: string | null
	copied: boolean
	errorText: string
	isRunning: boolean
	lastActionId: string | null
	onClose: () => void
	onCopy: () => void
	onReplace: () => void
	onRerun: () => void
	processedText: string
	selectedText: string
	show: boolean
}
