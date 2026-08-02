import { useCallback } from "react";
import { browser } from "wxt/browser";
import type { AIProvider, ToolbarAction, ToolbarState } from "@/types";
import { createActionPrompt, getFriendlyActionError } from "./utils";

export function useActionHandlers(
  stateRef: React.MutableRefObject<ToolbarState>,
  providerRef: React.MutableRefObject<AIProvider>,
  modelRef: React.MutableRefObject<string>,
  dispatch: (action: ToolbarAction) => void,
  selectionRangeRef: React.MutableRefObject<Range | null>
) {
  const handleAction = useCallback(
    async (actionId: string, customPrompt?: string) => {
      const current = stateRef.current;
      if (!current.selectedText.trim() || current.isRunning) {
        return;
      }

      dispatch({ actionId, type: "RUN_ACTION" });

      try {
        const prompt = createActionPrompt(
          actionId,
          current.selectedText,
          customPrompt
        );

        const response = await browser.runtime.sendMessage({
          model: modelRef.current,
          prompt,
          provider: providerRef.current,
          systemPrompt:
            "You are a text transformation tool. Output ONLY the transformed text — no greetings, no explanations, no commentary, no markdown, no quotation marks, no prefixes like 'Here is'. Never wrap the text in quotes or backticks. Never add introductory or concluding sentences. Output the result directly as plain text.",
          type: "RUN_PROMPT",
        });

        if (response.error) {
          dispatch({
            error: getFriendlyActionError(new Error(response.error)),
            type: "ACTION_ERROR",
          });
          return;
        }

        const normalized = response.text?.trim() ?? "";
        if (!normalized) {
          dispatch({
            error:
              "The model returned an empty response. Try again with a different model.",
            type: "ACTION_ERROR",
          });
          return;
        }

        dispatch({ text: normalized, type: "ACTION_SUCCESS" });
      } catch (error) {
        dispatch({
          error: getFriendlyActionError(error),
          type: "ACTION_ERROR",
        });
      }
    },
    [stateRef, providerRef, modelRef, dispatch]
  );

  const handleCopy = useCallback(async () => {
    const current = stateRef.current;
    const textToCopy = current.processedText || current.errorText;
    if (!textToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      dispatch({ type: "COPIED" });
      window.setTimeout(() => dispatch({ type: "COPY_RESET" }), 1400);
    } catch {
      // Ignore clipboard failures.
    }
  }, [stateRef, dispatch]);

  const handleRerun = useCallback(() => {
    const current = stateRef.current;
    if (
      !current.lastActionId ||
      current.isRunning ||
      !current.selectedText.trim()
    ) {
      return;
    }

    void handleAction(current.lastActionId);
  }, [stateRef, handleAction]);

  const handleReplace = useCallback(() => {
    const current = stateRef.current;
    if (!current.processedText || current.isRunning || current.errorText) {
      return;
    }

    const savedRange = selectionRangeRef.current;
    if (!savedRange) {
      dispatch({
        error:
          "Could not replace text because the original selection was lost.",
        type: "ACTION_ERROR",
      });
      return;
    }

    try {
      const range = savedRange.cloneRange();
      range.deleteContents();
      const replacementNode = document.createTextNode(current.processedText);
      range.insertNode(replacementNode);

      const selection = window.getSelection();
      if (selection) {
        const cursorRange = document.createRange();
        cursorRange.setStartAfter(replacementNode);
        cursorRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(cursorRange);
      }

      dispatch({ type: "RESET" });
      selectionRangeRef.current = null;
    } catch {
      dispatch({
        error:
          "Failed to replace text in this area. Select text again and retry.",
        type: "ACTION_ERROR",
      });
    }
  }, [stateRef, dispatch, selectionRangeRef]);

  const handleClose = useCallback(() => {
    dispatch({ type: "RESET" });
    selectionRangeRef.current = null;
    window.getSelection()?.removeAllRanges();
  }, [dispatch, selectionRangeRef]);

  return { handleAction, handleClose, handleCopy, handleReplace, handleRerun };
}
