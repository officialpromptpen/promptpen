import { useCallback, useRef } from "react";
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<string | null>(null);

  const cancelActiveRequest = useCallback(() => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort("User cancelled prompt execution.");
      } catch {
        // Ignore abort errors
      }
      abortControllerRef.current = null;
    }

    if (requestIdRef.current) {
      const activeId = requestIdRef.current;
      requestIdRef.current = null;
      void browser.runtime.sendMessage({
        requestId: activeId,
        type: "ABORT_PROMPT",
      }).catch(() => {
        // Ignore messaging failures on abort
      });
    }
  }, []);

  const handleAction = useCallback(
    async (actionId: string, customPrompt?: string) => {
      const current = stateRef.current;
      if (!current.selectedText.trim() || current.isRunning) {
        return;
      }

      // Abort any existing active request before starting a new one
      cancelActiveRequest();

      const controller = new AbortController();
      const requestId = crypto.randomUUID();
      abortControllerRef.current = controller;
      requestIdRef.current = requestId;

      dispatch({ actionId, type: "RUN_ACTION" });

      try {
        const prompt = createActionPrompt(
          actionId,
          current.selectedText,
          customPrompt
        );

        const systemPrompt =
          "You are PromptPen, an AI writing assistant. Output ONLY the transformed text — no greetings, no explanations, no commentary, no markdown, no quotation marks, and no instructions in output text.";

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
            if (controller.signal.aborted) {
              return;
            }

            if (adapter.runWritingAction) {
              const output = await adapter.runWritingAction(
                actionId,
                current.selectedText,
                undefined,
                controller.signal
              );
              response = { output, text: output.result };
            } else {
              const text = await adapter.runPrompt(
                prompt,
                systemPrompt,
                controller.signal
              );
              response = { text };
            }
          } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
              return;
            }
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
            requestId,
            selectedText: current.selectedText,
            systemPrompt,
            type: "RUN_WRITING_ACTION",
          });
        }

        if (controller.signal.aborted) {
          return;
        }

        if (response.error) {
          if (response.error.includes("cancelled") || response.error.includes("aborted")) {
            return;
          }
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
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        dispatch({
          error: getFriendlyActionError(error, providerRef.current),
          type: "ACTION_ERROR",
        });
      } finally {
        if (requestIdRef.current === requestId) {
          requestIdRef.current = null;
        }
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [stateRef, providerRef, modelRef, dispatch, cancelActiveRequest]
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
    cancelActiveRequest();
    dispatch({ type: "RESET" });
    selectionRangeRef.current = null;
    window.getSelection()?.removeAllRanges();
  }, [dispatch, selectionRangeRef, cancelActiveRequest]);

  return { handleAction, handleClose, handleCopy, handleReplace, handleRerun };
}
