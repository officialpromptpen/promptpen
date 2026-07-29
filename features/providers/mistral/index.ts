import { createMistral } from "@ai-sdk/mistral"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "mistral",
  label: "Mistral",
  defaultModel: "mistral-small-latest",
  category: "cloud",
  createModel: (config) => {
    const client = createMistral({ apiKey: config.apiKey })
    return client(config.model)
  },
}
