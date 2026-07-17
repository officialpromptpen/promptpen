import { create } from "zustand"
import type { ToolbarStore } from "@/types"

export const useToolbarStore = create<ToolbarStore>((set) => ({
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
