import { createOpenAI } from "@ai-sdk/openai"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "openrouter",
  label: "OpenRouter",
  defaultModel: "openai/gpt-4o-mini",
  category: "openai-compatible",
  createModel: (config) => {
    const client = createOpenAI({
      apiKey: config.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": "chrome-extension://promptpen",
        "X-OpenRouter-Title": "PromptPen",
      },
    })
    return client.chat(config.model)
  },
}
