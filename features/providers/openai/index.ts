import { createOpenAI } from "@ai-sdk/openai"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "openai",
  label: "OpenAI",
  defaultModel: "gpt-4o-mini",
  createModel: (config) => {
    const client = createOpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl })
    return client(config.model)
  },
}
