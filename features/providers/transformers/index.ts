import { pipeline, env } from "@huggingface/transformers"
import type { LanguageModel } from "ai"
import type { ProviderModule } from "../_types"

env.allowRemoteModels = true
env.allowLocalModels = false

function formatPrompt(
  messages: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>,
): string {
  const parts: string[] = []

  for (const msg of messages) {
    const role = msg.role
    const content =
      typeof msg.content === "string"
        ? msg.content
        : msg.content
            .filter((p) => p.type === "text")
            .map((p) => p.text ?? "")
            .join("")

    parts.push(`<|im_start|>${role}\n${content}<|im_end|>`)
  }

  parts.push("<|im_start|>assistant\n")
  return parts.join("\n")
}

function extractResponse(fullText: string): string {
  const parts = fullText.split("<|im_start|>assistant\n")
  const last = parts.pop()
  return last?.replace(/<\|im_end\|>\s*$/, "").trim() ?? ""
}

async function createTransformersModel(modelId: string) {
  const pipe = await pipeline("text-generation", modelId, {
    dtype: "q4",
  })

  return {
    specificationVersion: "v4" as const,
    provider: "transformers",
    modelId,
    supportedUrls: {},
    doGenerate: async (options: {
      prompt: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>
      maxOutputTokens?: number
      temperature?: number
      stopSequences?: string[]
    }) => {
      const prompt = formatPrompt(options.prompt)
      const result = await pipe(prompt, {
        max_new_tokens: options.maxOutputTokens ?? 512,
        temperature: options.temperature ?? 0.7,
        do_sample: options.temperature != null,
        stop: options.stopSequences ?? ["<|im_end|>", "<|im_start|>"],
      })

      const generatedText = (result as Array<{ generated_text: string }>)[0]?.generated_text ?? ""
      const response = extractResponse(generatedText)

      return {
        content: [{ type: "text" as const, text: response }],
        finishReason: { unified: "stop" as const, raw: "stop" },
        usage: {
          inputTokens: {
            total: undefined,
            noCache: undefined,
            cacheRead: undefined,
            cacheWrite: undefined,
          },
          outputTokens: {
            total: undefined,
            text: undefined,
            reasoning: undefined,
          },
        },
        warnings: [],
      }
    },
    doStream: async (options: {
      prompt: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>
      maxOutputTokens?: number
      temperature?: number
      stopSequences?: string[]
    }) => {
      const result = await pipe(
        formatPrompt(options.prompt),
        {
          max_new_tokens: options.maxOutputTokens ?? 512,
          temperature: options.temperature ?? 0.7,
          do_sample: options.temperature != null,
          stop: options.stopSequences ?? ["<|im_end|>", "<|im_start|>"],
        },
      )

      const generatedText = (result as Array<{ generated_text: string }>)[0]?.generated_text ?? ""
      const response = extractResponse(generatedText)

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "text-start", id: "0" })
          if (response.length > 0) {
            controller.enqueue({ type: "text-delta", id: "0", delta: response })
          }
          controller.enqueue({ type: "text-end", id: "0" })
          controller.enqueue({
            type: "finish",
            usage: {
              inputTokens: {
                total: undefined,
                noCache: undefined,
                cacheRead: undefined,
                cacheWrite: undefined,
              },
              outputTokens: {
                total: undefined,
                text: undefined,
                reasoning: undefined,
              },
            },
            finishReason: { unified: "stop" as const, raw: "stop" },
          })
          controller.close()
        },
      })

      return { stream }
    },
  }
}

let modelPromise: ReturnType<typeof createTransformersModel> | null = null

export const provider: ProviderModule = {
  id: "transformers",
  label: "Transformers.js",
  defaultModel: "Xenova/Qwen2-0.5B-Instruct",
  category: "self-hosted",
  createModel: (config) => {
    if (!modelPromise) {
      modelPromise = createTransformersModel(config.model)
    }

    const delegate = async () => {
      const m = await modelPromise!
      return m
    }

    return {
      specificationVersion: "v4" as const,
      provider: "transformers",
      modelId: config.model,
      supportedUrls: {},
      doGenerate: async (options: unknown) => {
        const m = await modelPromise!
        return m.doGenerate(options as never)
      },
      doStream: async (options: unknown) => {
        const m = await modelPromise!
        return m.doStream(options as never)
      },
    } as unknown as LanguageModel
  },
}
