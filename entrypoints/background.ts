import { createCloudProviderAdapter } from "@/features/providers/sdk";
import { normalizeModelOutput } from "@/features/toolbar/utils";
import type { AIProvider, WritingOutput } from "@/types";

const activeRequests = new Map<string, AbortController>();

export default defineBackground(() => {
  console.log("PromptPen background service worker loaded.", {
    id: browser.runtime.id,
  });

  browser.runtime.onMessage.addListener(
    (
      message: {
        type: string;
        requestId?: string;
        provider?: AIProvider;
        model?: string;
        prompt?: string;
        systemPrompt?: string;
        actionId?: string;
        selectedText?: string;
        targetLanguage?: string;
        customPrompt?: string;
        prefix?: string;
      },
      sender,
      sendResponse
    ) => {
      // Security: Validate message origin to ensure messages come from internal extension context
      if (sender.id && sender.id !== browser.runtime.id) {
        return false;
      }

      if (message.type === "ABORT_PROMPT") {
        if (message.requestId && activeRequests.has(message.requestId)) {
          const controller = activeRequests.get(message.requestId);
          controller?.abort("Prompt execution aborted by user.");
          activeRequests.delete(message.requestId);
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false });
        }
        return true;
      }

      if (
        message.type === "RUN_PROMPT" ||
        message.type === "RUN_WRITING_ACTION"
      ) {
        if (message.provider === "transformers") {
          // Transformers.js (WASM) cannot run in a service worker — it must run
          // directly in the content script window context.
          sendResponse({
            error:
              "TransformersJS models run in the browser window context (content script), not the service worker. This is a bug — please reload the extension.",
          });
          return true;
        }
        void handleRunPrompt(message, sendResponse);
        return true; // Keep the message channel open for async response
      }
      return false;
    }
  );
});

async function handleRunPrompt(
  message: {
    requestId?: string;
    provider?: AIProvider;
    model?: string;
    prompt?: string;
    systemPrompt?: string;
    actionId?: string;
    selectedText?: string;
    targetLanguage?: string;
  },
  sendResponse: (response: {
    text?: string;
    output?: WritingOutput;
    error?: string;
  }) => void
) {
  const controller = new AbortController();
  if (message.requestId) {
    activeRequests.set(message.requestId, controller);
  }

  try {
    const adapter = await createCloudProviderAdapter(
      message.provider,
      message.model
    );
    if (!adapter) {
      sendResponse({
        error:
          "No AI provider configured. Go to Dashboard > AI Providers in Options and add a provider with API key.",
      });
      return;
    }

    if (message.actionId && message.selectedText && adapter.runWritingAction) {
      const output = await adapter.runWritingAction(
        message.actionId,
        message.selectedText,
        message.targetLanguage,
        controller.signal
      );
      const normalized = normalizeModelOutput(output.result);
      if (!normalized) {
        sendResponse({
          error: "The model returned an empty result. Try again.",
        });
        return;
      }
      sendResponse({ output, text: normalized });
      return;
    }

    const result = await adapter.runPrompt(
      message.prompt ?? "",
      message.systemPrompt,
      controller.signal
    );

    const normalized = normalizeModelOutput(result);
    if (!normalized) {
      sendResponse({
        error:
          "The model returned an empty response. Try again with a different model.",
      });
      return;
    }

    sendResponse({ text: normalized });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      sendResponse({ error: "Request was cancelled." });
      return;
    }
    const msg = error instanceof Error ? error.message : "Unknown AI error";
    sendResponse({ error: msg });
  } finally {
    if (message.requestId) {
      activeRequests.delete(message.requestId);
    }
  }
}
