import { env } from "@huggingface/transformers"
import { transformersJS } from "@browser-ai/transformers-js"
import type { LanguageModel } from "ai"
import type { ProviderModule } from "../_types"
import { RECOMMENDED_MODELS } from "./recommended-models"

function configureBackend(): void {
  const base = globalThis.chrome?.runtime?.getURL("onnx/")
  if (base && env.backends.onnx?.wasm) {
    env.backends.onnx.wasm.wasmPaths = {
      wasm: `${base}ort-wasm-simd-threaded.asyncify.wasm`,
      mjs: `${base}ort-wasm-simd-threaded.asyncify.mjs`,
    }
  }
}

function configureAuth(accessToken?: string): void {
  if (!accessToken) return

  const originalFetch = env.fetch
  env.fetch = (input: string | URL, init?: Record<string, unknown>) => {
    const headers = new Headers(init?.headers as Record<string, string> | undefined)
    headers.set("Authorization", `Bearer ${accessToken}`)
    return originalFetch(input, { ...init, headers })
  }
}

export { RECOMMENDED_MODELS } from "./recommended-models"
export type { RecommendedModel } from "./recommended-models"

export const provider: ProviderModule = {
  id: "transformers",
  label: "Transformers.js",
  defaultModel: RECOMMENDED_MODELS[0].modelId,
  category: "self-hosted",
  createModel: (config) => {
    configureBackend()
    configureAuth(config.accessToken)

    const model = transformersJS(config.model, {
      device: "wasm",
    })

    return model as unknown as LanguageModel
  },
}
