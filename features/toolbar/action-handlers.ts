import { useCallback } from "react";
import { browser } from "wxt/browser";
import type {
  AIProvider,
  ProviderAdapter,
  ToolbarAction,
  ToolbarState,
  WritingOutput,
} from "@/types";
import {
  createActionPrompt,
  getFriendlyActionError,
  normalizeModelOutput,
} from "./utils";

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

        const systemPrompt =
          "You are PromptPen, an AI writing assistant. Output ONLY the transformed text — no greetings, no explanations, no commentary, no markdown, no quotation marks.";

        let response: { text?: string; output?: WritingOutput; error?: string };

        if (providerRef.current === "transformers") {
          try {
            const url = browser.runtime.getURL(
              "/transformers-adapter.js" as never
            );
            await import(/* @vite-ignore */ url);
            const createAdapter = (
              window as unknown as {
                __promptpen_createTransformersAdapter?: (
                  model: string
                ) => Promise<ProviderAdapter>;
              }
            ).__promptpen_createTransformersAdapter;

            if (typeof createAdapter !== "function") {
              throw new Error("createTransformersAdapter is not available.");
            }

            const adapter = await createAdapter(modelRef.current);
            if (adapter.runWritingAction) {
              const output = await adapter.runWritingAction(
                actionId,
                current.selectedText
              );
              response = { output, text: output.result };
            } else {
              const text = await adapter.runPrompt(prompt, systemPrompt);
              response = { text };
            }
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "TransformersJS failed.";
            response = { error: msg };
          }
        } else {
          // Send structured writing action request to service worker background
          response = await browser.runtime.sendMessage({
            actionId,
            model: modelRef.current,
            prompt,
            provider: providerRef.current,
            selectedText: current.selectedText,
            systemPrompt,
            type: "RUN_WRITING_ACTION",
          });
        }

        if (response.error) {
          dispatch({
            error: getFriendlyActionError(
              new Error(response.error),
              providerRef.current
            ),
            type: "ACTION_ERROR",
          });
          return;
        }

        const rawResult = response.output?.result ?? response.text ?? "";
        const normalized = normalizeModelOutput(rawResult);
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
          error: getFriendlyActionError(error, providerRef.current),
          type: "ACTION_ERROR",
        });
      }
    },
    [stateRef, providerRef, modelRef, dispatch]
  );

  const handleCopy = useCallback(async () => {
    const current = stateRef.current;
    // Copy ONLY the final generated result text
    const textToCopy = current.processedText;
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
