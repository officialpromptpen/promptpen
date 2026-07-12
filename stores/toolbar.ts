import { create } from "zustand"

interface ToolbarState {
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

export const useToolbarStore = create<ToolbarState>((set) => ({
  isVisible: false,
  isPinned: false,
  isEditableSelection: false,
  selectedText: "",
  selectionRect: null,
  selectionRange: null,
  show: (text, rect, range, isEditableSelection) =>
    set({
      isVisible: true,
      isPinned: false,
      isEditableSelection,
      selectedText: text,
      selectionRect: rect,
      selectionRange: range,
    }),
  hide: () =>
    set({
      isVisible: false,
      isPinned: false,
      isEditableSelection: false,
      selectedText: "",
      selectionRect: null,
      selectionRange: null,
    }),
  setPinned: (isPinned) => set({ isPinned }),
}))
