import { createOpenAI } from "@ai-sdk/openai";
import type { ProviderModule } from "../_types";

export const provider: ProviderModule = {
  category: "openai-compatible",
  createModel: (config) => {
    const client = createOpenAI({
      apiKey: config.apiKey,
      baseURL: "https://api.together.xyz/v1",
    });
    return client.chat(config.model);
  },
  defaultModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  id: "together",
  label: "Together AI",
};
