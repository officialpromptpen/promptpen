import { createOpenAI } from "@ai-sdk/openai";
import type { ProviderModule } from "../_types";

export const provider: ProviderModule = {
  category: "cloud",
  createModel: (config) => {
    const client = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    return client(config.model);
  },
  defaultModel: "gpt-4o-mini",
  id: "openai",
  label: "OpenAI",
};
