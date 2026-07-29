import { createOpenAI } from "@ai-sdk/openai"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "openai-compatible",
  label: "OpenAI Compatible",
  defaultModel: "gpt-4o-mini",
  category: "openai-compatible",
  createModel: (config) => {
    const client = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    })
    return client.chat(config.model)
  },
}
