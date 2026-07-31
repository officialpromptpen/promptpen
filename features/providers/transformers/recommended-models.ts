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
