import { createCohere } from "@ai-sdk/cohere";
import type { ProviderModule } from "../_types";

export const provider: ProviderModule = {
  category: "cloud",
  createModel: (config) => {
    const client = createCohere({ apiKey: config.apiKey });
    return client(config.model);
  },
  defaultModel: "command-r-plus",
  id: "cohere",
  label: "Cohere",
};
