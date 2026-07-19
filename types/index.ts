import type { LucideIcon, Settings } from "lucide-react"
import type { ReactNode, KeyboardEvent as ReactKeyboardEvent } from "react"
import type { getProviderDefinition } from "@/features/providers/catalog"

// ──────────────────────────── Core Domain Types ────────────────────────────

export type AIProvider =
  | "openrouter"
  | "openai"
  | "anthropic"
  | "gemini"
  | "groq"
  | "ollama"
  | "together"
  | "cohere"
  | "deepseek"
  | "mistral"
  | "openai-compatible"

export type Theme = "light" | "dark" | "system"

export type ActionCategory = "rewrite" | "modify" | "tone" | "transform"

export interface Action {
  id: string
  label: string
  category: ActionCategory
  prompt: string
  icon: LucideIcon
}

export interface WebsiteRule {
  id: string
  hostname: string
  enabled: boolean
}

// ──────────────────────────── Toolbar Types ────────────────────────────

export type ToolbarCategory = "all" | ActionCategory | "custom-prompt"

export interface ToolbarPosition {
  x: number
  y: number
  visible: boolean
}

export type ToolbarAction =
  | { type: "SELECTION_CHANGED"; text: string; position: ToolbarPosition }
  | { type: "HIDE_TOOLBAR_IF_VISIBLE" }
  | { type: "RUN_ACTION"; actionId: string }
  | { type: "ACTION_SUCCESS"; text: string }
  | { type: "ACTION_ERROR"; error: string }
  | { type: "COPIED" }
  | { type: "COPY_RESET" }
  | { type: "RESET" }

export interface ToolbarState {
  selectedText: string
  toolbarPos: ToolbarPosition
  showResult: boolean
  processedText: string
  isRunning: boolean
  activeActionId: string | null
  lastActionId: string | null
  errorText: string
  copied: boolean
}

export interface ToolbarActionsProps {
  onAction: (actionId: string) => void
  onRunCustomPrompt: (prompt: string) => void
  onProviderChange: (provider: AIProvider) => void
  onModelChange: (model: string) => void
  selectedProvider: AIProvider
  selectedModel: string
  configuredProviders?: AIProvider[]
  configuredProviderModels?: Partial<Record<AIProvider, string>>
  isLoading?: boolean
  activeActionId?: string | null
  enabledActionIds?: string[]
}

export interface ToolbarPopoverProps {
  visible: boolean
  portalNode: HTMLElement | null
  toolbarPos: ToolbarPosition
  isRunning: boolean
  activeActionId: string | null
  selectedProvider: AIProvider
  selectedModel: string
  onAction: (actionId: string) => void
  onRunCustomPrompt: (prompt: string) => void
  onProviderChange: (provider: AIProvider) => void
  onModelChange: (model: string) => void
  configuredProviders: AIProvider[]
  configuredProviderModels: Partial<Record<AIProvider, string>>
}

// toolbar subcomponent prop types

export interface CategoryFilterBarProps {
  categories: { id: ToolbarCategory; label: string }[]
  activeCategory: ToolbarCategory
  onCategoryChange: (category: ToolbarCategory) => void
}

export interface ActionGroupListProps {
  groupedActions: { category: ActionCategory; items: Action[] }[]
  isLoading: boolean
  activeActionId: string | null
  onAction: (actionId: string) => void
  onKeyDown: (event: ReactKeyboardEvent, actionId: string) => void
}

export interface ClosedToolbarStateProps {
  onOpen: () => void
}

export interface CustomPromptListProps {
  prompts: CustomPromptDefinition[]
  isLoading: boolean
  onRun: (prompt: CustomPromptDefinition) => void
}

export interface ResultActionsProps {
  copied: boolean
  isRunning: boolean
  processedText: string
  errorText: string
  selectedText: string
  lastActionId: string | null
  onCopy: () => void
  onReplace: () => void
  onRerun: () => void
  onClose: () => void
}

export interface ResultBodyProps {
  isRunning: boolean
  activeActionId: string | null
  errorText: string
  processedText: string
}

export interface ResultDialogProps {
  show: boolean
  isRunning: boolean
  activeActionId: string | null
  processedText: string
  errorText: string
  copied: boolean
  selectedText: string
  lastActionId: string | null
  onCopy: () => void
  onReplace: () => void
  onRerun: () => void
  onClose: () => void
}

// ──────────────────────────── Provider Types ────────────────────────────

export interface ProviderDefinition {
  id: AIProvider
  label: string
  defaultModel: string
  baseUrl?: string
}

export interface ProviderAdapter {
  provider: AIProvider
  model: string
  runPrompt: (input: string, systemPrompt?: string) => Promise<string>
}

export interface ProviderRuntimeConfig {
  provider: AIProvider
  model: string
  apiKey: string
  baseUrl?: string
}

export interface ProviderSummary {
  configuredProviders: AIProvider[]
  unconfiguredProviders: AIProvider[]
  defaultProvider: AIProvider
  defaultModel: string
}

export interface ConfiguredProviderDetail {
  provider: AIProvider
  label: string
  model: string
  updatedAt: number
}

export interface ProviderIconProps {
  provider: AIProvider
  className?: string
}

export type ProviderTestResult = { ok: boolean; message?: string }

export type ProviderEditorState = { model: string; hasApiKey: boolean }

// ──────────────────────────── Storage Types ────────────────────────────

export interface WebsiteAccessState {
  enableEverywhere: boolean
  websiteRules: WebsiteRule[]
  excludedHostnames: string[]
}

export interface CustomPromptDefinition {
  id: string
  title: string
  prompt: string
  updatedAt: number
}

// ──────────────────────────── Options Page Types ────────────────────────────

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

export interface OptionsState {
  activeSection: SectionId
  setActiveSection: (id: SectionId) => void
  loaded: boolean
  settings: OptionsSettings
  setSettings: React.Dispatch<React.SetStateAction<OptionsSettings>>
  providerSummary: ProviderSummary | null
  configuredProviderDetails: ConfiguredProviderDetail[]
  customPrompts: CustomPromptDefinition[]
  selectedProvider: AIProvider
  setSelectedProvider: React.Dispatch<React.SetStateAction<AIProvider>>
  providerModel: string
  setProviderModel: React.Dispatch<React.SetStateAction<string>>
  apiKey: string
  setApiKey: React.Dispatch<React.SetStateAction<string>>
  hasStoredApiKey: boolean
  isSavingProvider: boolean
  isTestingProvider: boolean
  connectionVerified: boolean
  providerStatusMessage: string
  providerStatusType: "idle" | "success" | "error"
  selectedProviderDefinition: ReturnType<typeof getProviderDefinition>
  unconfiguredProviders: number
  handleSaveProvider: () => Promise<void>
  handleTestProvider: () => Promise<void>
  selectProvider: (provider: AIProvider) => void
  handleEditProvider: (provider: AIProvider) => void
  handleDeleteProvider: (provider: AIProvider) => Promise<void>
  handleSaveCustomPrompt: (title: string, prompt: string, promptId?: string) => Promise<void>
  handleDeleteCustomPrompt: (promptId: string) => Promise<void>
  resetAllData: () => void
  exportSettings: () => void
}

// ──────────────────────────── UI Types ────────────────────────────

export interface LayoutProps {
  children: ReactNode
  variant?: "panel" | "inline"
}

export interface StatusCardProps {
  url: string
}

export interface ActiveTabState {
  title: string
  url: string
  loading: boolean
}

// ──────────────────────────── Toast / Notification Types ────────────────────────────

export interface ToastAction {
  label: string
  onClick: () => void
}

// ──────────────────────────── Toolbar Store (Zustand) Types ────────────────────────────

export interface ToolbarStore {
  isVisible: boolean
  isPinned: boolean
  isEditableSelection: boolean
  selectedText: string
  selectionRect: DOMRect | null
  selectionRange: Range | null
  show: (text: string, rect: DOMRect, range: Range | null, isEditableSelection: boolean) => void
  hide: () => void
  setPinned: (isPinned: boolean) => void
}

// ──────────────────────────── Options Section Types ────────────────────────────

export interface AddFormProps {
  id: string
  value: string
  onChange: (value: string) => void
  onAdd: () => void
  placeholder: string
  label: string
  description: string
  icon: React.ReactNode
  preview: string[]
}

export interface WebsiteListSectionProps {
  title: string
  items: string[]
  deleteConfirm: string | null
  onRemove: (hostname: string) => void
  onDeleteConfirm: (hostname: string | null) => void
  onCancelDelete: () => void
  icon: React.ReactNode
  emptyTitle: string
  emptyDescription: string
}

export interface WebsiteAccessStateParam {
  websiteRules: { enabled: boolean; hostname: string }[]
}
