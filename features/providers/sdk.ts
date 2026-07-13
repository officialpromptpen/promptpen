import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { AIProvider } from "@/types"
import { getProviderDefinition } from "./catalog"
import { getRuntimeConfig } from "./storage"

const chatCompletionsProviders = new Set<AIProvider>([
  "openrouter",
  "gemini",
  "groq",
  "ollama",
  "together",
  "cohere",
  "deepseek",
  "mistral",
])

export interface ProviderAdapter {
  provider: AIProvider
  model: string
  runPrompt: (input: string, systemPrompt?: string) => Promise<string>
}

export async function createProviderAdapter(
  provider?: AIProvider,
): Promise<ProviderAdapter | null> {
  const config = await getRuntimeConfig(provider)
  if (!config) {
    return null
  }

  const openai = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    headers:
      config.provider === "openrouter"
        ? {
            "HTTP-Referer": "chrome-extension://promptpen",
            "X-OpenRouter-Title": "PromptPen",
          }
        : undefined,
  })
  const model = chatCompletionsProviders.has(config.provider)
    ? openai.chat(config.model)
    : openai(config.model)

  return {
    provider: config.provider,
    model: config.model,
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
): Promise<{ ok: boolean; message?: string }> {
  const definition = getProviderDefinition(provider)
  const resolvedBaseUrl = baseUrl ?? definition.baseUrl

  try {
    const openai = createOpenAI({
      apiKey,
      baseURL: resolvedBaseUrl,
    })
    const client = chatCompletionsProviders.has(provider) ? openai.chat(model) : openai(model)

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
