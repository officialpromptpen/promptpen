import type { ToolbarAction, ToolbarState } from "@/types";

export const INITIAL_TOOLBAR_STATE: ToolbarState = {
  activeActionId: null,
  copied: false,
  errorText: "",
  isRunning: false,
  lastActionId: null,
  processedText: "",
  selectedText: "",
  showResult: false,
  toolbarPos: { visible: false, x: 0, y: 0 },
};

export function toolbarReducer(
  state: ToolbarState,
  action: ToolbarAction
): ToolbarState {
  switch (action.type) {
    case "SELECTION_CHANGED":
      if (state.showResult) {
        return state;
      }
      return {
        ...state,
        selectedText: action.text,
        toolbarPos: action.position,
      };
    case "HIDE_TOOLBAR_IF_VISIBLE":
      if (state.showResult) {
        return state;
      }
      return { ...state, toolbarPos: { ...state.toolbarPos, visible: false } };
    case "RUN_ACTION":
      if (!state.selectedText.trim() || state.isRunning) {
        return state;
      }
      return {
        ...state,
        activeActionId: action.actionId,
        copied: false,
        errorText: "",
        isRunning: true,
        lastActionId: action.actionId,
        processedText: "",
        showResult: true,
        toolbarPos: { ...state.toolbarPos, visible: false },
      };
    case "ACTION_SUCCESS":
      return {
        ...state,
        activeActionId: null,
        isRunning: false,
        processedText: action.text,
      };
    case "ACTION_ERROR":
      return {
        ...state,
        activeActionId: null,
        errorText: action.error,
        isRunning: false,
      };
    case "COPIED":
      return { ...state, copied: true };
    case "COPY_RESET":
      return { ...state, copied: false };
    case "RESET":
      return { ...INITIAL_TOOLBAR_STATE };
  }
}
