import { createProviderAdapter } from "@/features/providers/sdk";
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
      },
      _sender,
      sendResponse
    ) => {
      if (message.type === "RUN_PROMPT") {
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
    const adapter = await createProviderAdapter(
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

    const normalized = result.trim();
    if (!normalized) {
      sendResponse({
        error:
          "The model returned an empty response. Try again with a different model.",
      });
      return;
    }

    sendResponse({ text: normalized });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI error";
    sendResponse({ error: `Request failed: ${message}` });
  }
}
