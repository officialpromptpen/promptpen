import { createAnthropic } from "@ai-sdk/anthropic"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "anthropic",
  label: "Anthropic",
  defaultModel: "claude-3-5-haiku-latest",
  category: "cloud",
  createModel: (config) => {
    const client = createAnthropic({ apiKey: config.apiKey })
    return client(config.model)
  },
}
