import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { ProviderModule } from "../_types"

export const provider: ProviderModule = {
  id: "gemini",
  label: "Gemini",
  defaultModel: "gemini-1.5-flash",
  category: "cloud",
  createModel: (config) => {
    const client = createGoogleGenerativeAI({ apiKey: config.apiKey })
    return client(config.model)
  },
}
