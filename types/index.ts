import {
type LucideIcon
} from "lucide-react"

export type Theme = "light" | "dark" | "system"
 
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

export interface WebsiteRule {
  id: string
  hostname: string
  enabled: boolean
}


export interface Action {
  id: string
  label: string
  icon: LucideIcon
}

export interface ToolbarActionsProps {
  onAction: (actionId: string) => void
  isLoading?: boolean
  activeActionId?: string | null
  enabledActionIds?: string[]
  defaultActionId?: string | null
}


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

export type ToolbarAction =
  | { type: 'SELECTION_CHANGED'; text: string; position: ToolbarPosition }
  | { type: 'HIDE_TOOLBAR_IF_VISIBLE' }
  | { type: 'RUN_ACTION'; actionId: string }
  | { type: 'ACTION_SUCCESS'; text: string }
  | { type: 'ACTION_ERROR'; error: string }
  | { type: 'COPIED' }
  | { type: 'COPY_RESET' }
  | { type: 'RESET' }


 export interface ToolbarPosition {
  x: number
  y: number
  visible: boolean
}

export interface ToolbarPopoverProps {
  visible: boolean
  portalNode: HTMLElement | null
  toolbarPos: ToolbarPosition
  isRunning: boolean
  activeActionId: string | null
  onAction: (actionId: string) => void
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

// toolbar action

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