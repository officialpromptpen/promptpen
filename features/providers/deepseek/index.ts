import { createDeepSeek } from "@ai-sdk/deepseek"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "deepseek",
  label: "DeepSeek",
  defaultModel: "deepseek-chat",
  createModel: (config) => {
    const client = createDeepSeek({ apiKey: config.apiKey })
    return client(config.model)
  },
}
