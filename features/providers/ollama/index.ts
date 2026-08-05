import { createOpenAI } from "@ai-sdk/openai";
import type { ProviderModule } from "../_types";

export const provider: ProviderModule = {
  category: "self-hosted",
  createModel: (config) => {
    let baseUrl = config.baseUrl?.trim() || "http://localhost:11434/v1";
    if (!baseUrl.endsWith("/v1") && !baseUrl.endsWith("/v1/")) {
      baseUrl = `${baseUrl.replace(/\/+$/, "")}/v1`;
    }
    const client = createOpenAI({
      apiKey: config.apiKey || "ollama",
      baseURL: baseUrl,
    });
    return client.chat(config.model);
  },
  defaultModel: "llama3.1",
  id: "ollama",
  label: "Ollama",
};
