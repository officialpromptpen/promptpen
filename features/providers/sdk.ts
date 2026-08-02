import type { AIProvider, ProviderAdapter, ProviderTestResult } from "@/types"
import { getProviderModule } from "./registry"
import { getRuntimeConfig } from "./storage"

export async function createProviderAdapter(
  provider?: AIProvider,
  modelOverride?: string,
): Promise<ProviderAdapter | null> {
  const config = await getRuntimeConfig(provider)
  if (!config) {
    return null
  }

  const resolvedModel = modelOverride?.trim() || config.model
  const mod = await getProviderModule(config.provider)
  const model = mod.createModel({ apiKey: config.apiKey, model: resolvedModel, accessToken: config.accessToken })

  const { generateText } = await import("ai")

  return {
    provider: config.provider,
    model: resolvedModel,
    runPrompt: async (input: string, systemPrompt?: string) => {
      const { text } = await generateText({
        model,
        prompt: input,
        system: systemPrompt,
      })
      return text
    },
  }
}

export async function testProviderConnectionWithValues(
  provider: AIProvider,
  model: string,
  apiKey: string,
  baseUrl?: string,
): Promise<ProviderTestResult> {
  try {
    const { generateText } = await import("ai")
    const mod = await getProviderModule(provider)
    const client = mod.createModel({ apiKey, model, baseUrl })

    await generateText({
      model: client,
      prompt: "Reply with exactly one word: ready",
      system: "You are a connection test assistant.",
    })
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown provider error."
    return { ok: false, message }
  }
}
