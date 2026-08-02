import { createMistral } from "@ai-sdk/mistral";
import type { ProviderModule } from "../_types";

export const provider: ProviderModule = {
  category: "cloud",
  createModel: (config) => {
    const client = createMistral({ apiKey: config.apiKey });
    return client(config.model);
  },
  defaultModel: "mistral-small-latest",
  id: "mistral",
  label: "Mistral",
};
