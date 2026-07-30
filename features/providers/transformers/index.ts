import { env } from "@huggingface/transformers"
import { transformersJS } from "@browser-ai/transformers-js"
import type { LanguageModel } from "ai"
import type { ProviderModule } from "../_types"

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

export interface RecommendedModel {
  modelId: string
  label: string
  description: string
}

export const RECOMMENDED_MODELS: RecommendedModel[] = [
  {
    modelId: "onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA",
    label: "Qwen2.5-0.5B-Instruct",
    description: "Best overall for writing. Strong instruction following, good grammar and tone control.",
  },
  {
    modelId: "onnx-community/Qwen2.5-1.5B-Instruct-ONNX-MHA",
    label: "Qwen2.5-1.5B-Instruct",
    description: "Most capable for complex writing tasks. Requires ~4GB RAM and longer download.",
  },
  {
    modelId: "onnx-community/SmolLM2-360M-Instruct-ONNX-MHA",
    label: "SmolLM2-360M-Instruct",
    description: "Lightweight writing assistant. Faster responses, decent quality for short text.",
  },
  {
    modelId: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA",
    label: "SmolLM2-135M-Instruct",
    description: "Fastest fallback. Best for simple rewrites and short selections.",
  },
]

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
