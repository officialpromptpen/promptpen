import type { ReactNode } from "react"

export interface ActiveTabState {
	loading: boolean
	title: string
	url: string
}

export interface LayoutProps {
	children: ReactNode
	variant?: "inline" | "panel"
}

export interface StatusCardProps {
	url: string
}

export interface ToastAction {
	label: string
	onClick: () => void
}

export interface ToolbarStore {
	hide: () => void
	isEditableSelection: boolean
	isPinned: boolean
	isVisible: boolean
	selectedText: string
	selectionRange: Range | null
	selectionRect: DOMRect | null
	setPinned: (isPinned: boolean) => void
	show: (
		text: string,
		rect: DOMRect,
		range: Range | null,
		isEditableSelection: boolean,
	) => void
}
