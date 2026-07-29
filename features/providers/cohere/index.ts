import { createCohere } from "@ai-sdk/cohere"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "cohere",
  label: "Cohere",
  defaultModel: "command-r-plus",
  createModel: (config) => {
    const client = createCohere({ apiKey: config.apiKey })
    return client(config.model)
  },
}
