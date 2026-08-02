import { createDeepSeek } from "@ai-sdk/deepseek";
import type { ProviderModule } from "../_types";

export const provider: ProviderModule = {
  category: "cloud",
  createModel: (config) => {
    const client = createDeepSeek({ apiKey: config.apiKey });
    return client(config.model);
  },
  defaultModel: "deepseek-chat",
  id: "deepseek",
  label: "DeepSeek",
};
