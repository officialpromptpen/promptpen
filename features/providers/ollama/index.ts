import { createOpenAI } from "@ai-sdk/openai"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "ollama",
  label: "Ollama",
  defaultModel: "llama3.1",
  category: "self-hosted",
  createModel: (config) => {
    const client = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl ?? "http://localhost:11434/v1",
    })
    return client.chat(config.model)
  },
}
