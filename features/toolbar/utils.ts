import { getActionById } from "@/constants/actions";

const EXTENSION_CONTEXT_INVALIDATED_RE = /extension context invalidated/i;
const SETUP_FAILURE_RE =
  /not configured|no provider|no api key|missing api key|provider.*(required|missing)|usefloating hook|contextual-toolbar\.tsx/i;

export function createActionPrompt(
  actionId: string,
  text: string,
  customPrompt?: string
): string {
  const instruction =
    actionId === "custom-prompt"
      ? customPrompt?.trim() || "Improve this text."
      : (getActionById(actionId)?.prompt ?? "Improve this text.");

  return `${instruction}\n\nText:\n${text}`;
}

export function getActionLabel(actionId: string | null): string {
  if (!actionId) {
    return "action";
  }

  if (actionId === "custom-prompt") {
    return "custom prompt";
  }

  return getActionById(actionId)?.label ?? actionId;
}

export function getFriendlyActionError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown AI error";

  if (EXTENSION_CONTEXT_INVALIDATED_RE.test(message)) {
    return "Extension was reloaded or updated. Refresh this page, select text again, and retry.";
  }

  if (
    message.includes("Ollama") ||
    message.includes("ECONNREFUSED") ||
    message.includes("fetch failed") ||
    message.includes("Failed to fetch") ||
    /forbidden/i.test(message) ||
    /model.*not found/i.test(message)
  ) {
    if (/forbidden/i.test(message)) {
      return "Ollama access forbidden: Set OLLAMA_ORIGINS=\"*\" in your Ollama environment to allow extension requests.";
    }
    if (/model.*not found/i.test(message)) {
      return "Ollama model not found. Ensure you pulled the model (e.g. `ollama pull <model>`) or check the model name in settings.";
    }
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("fetch failed") ||
      message.includes("Failed to fetch")
    ) {
      return "Ollama is not accessible. Ensure Ollama is running locally or check your Base URL & connection.";
    }
  }

  if (
    message.includes("TransformersModelError") ||
    message.startsWith("Failed to load model")
  ) {
    return `In-browser model error: ${message}`;
  }

  if (
    message.includes("model not found") ||
    message.includes("not found on Hugging Face")
  ) {
    return "Model not found. Check the model ID in Dashboard > Self-Hosted > Transformers.js.";
  }

  if (SETUP_FAILURE_RE.test(message)) {
    return "No AI provider configured. Go to Dashboard > AI Providers in Options and add a provider with API key.";
  }

  return `Request failed: ${message}`;
}
