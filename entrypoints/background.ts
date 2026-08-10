import { createCloudProviderAdapter } from "@/features/providers/sdk";
import { normalizeModelOutput } from "@/features/toolbar/utils";
import type { AIProvider } from "@/types";

export default defineBackground(() => {
  console.log("PromptPen background service worker loaded.", {
    id: browser.runtime.id,
  });

  browser.runtime.onMessage.addListener(
    (
      message: {
        type: string;
        provider?: AIProvider;
        model?: string;
        prompt?: string;
        systemPrompt?: string;
        actionId?: string;
        selectedText?: string;
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

      if (message.type === "RUN_PROMPT") {
        if (message.provider === "transformers") {
          // Transformers.js (WASM) cannot run in a service worker — it must run
          // directly in the content script window context. This path should never
          // be hit, but guard it explicitly so the error is clear.
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
    provider?: AIProvider;
    model?: string;
    prompt?: string;
    systemPrompt?: string;
  },
  sendResponse: (response: { text?: string; error?: string }) => void
) {
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

    const result = await adapter.runPrompt(
      message.prompt ?? "",
      message.systemPrompt
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
    const msg = error instanceof Error ? error.message : "Unknown AI error";
    sendResponse({ error: msg });
  }
}
