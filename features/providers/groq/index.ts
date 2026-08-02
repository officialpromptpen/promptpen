import { createGroq } from "@ai-sdk/groq";
import type { ProviderModule } from "../_types";

export const provider: ProviderModule = {
  category: "cloud",
  createModel: (config) => {
    const client = createGroq({ apiKey: config.apiKey });
    return client(config.model);
  },
  defaultModel: "llama-3.1-8b-instant",
  id: "groq",
  label: "Groq",
};
