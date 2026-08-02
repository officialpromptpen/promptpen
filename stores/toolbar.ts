import { create } from "zustand";
import type { ToolbarStore } from "@/types";

export const useToolbarStore = create<ToolbarStore>((set) => ({
  hide: () =>
    set({
      isEditableSelection: false,
      isPinned: false,
      isVisible: false,
      selectedText: "",
      selectionRange: null,
      selectionRect: null,
    }),
  isEditableSelection: false,
  isPinned: false,
  isVisible: false,
  selectedText: "",
  selectionRange: null,
  selectionRect: null,
  setPinned: (isPinned) => set({ isPinned }),
  show: (text, rect, range, isEditableSelection) =>
    set({
      isEditableSelection,
      isPinned: false,
      isVisible: true,
      selectedText: text,
      selectionRange: range,
      selectionRect: rect,
    }),
}));
