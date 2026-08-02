export interface RecommendedModel {
  description: string;
  label: string;
  modelId: string;
}

export const RECOMMENDED_MODELS: RecommendedModel[] = [
  {
    description:
      "Best overall for writing. Strong instruction following, good grammar and tone control.",
    label: "Qwen2.5-0.5B-Instruct",
    modelId: "onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA",
  },
  {
    description:
      "Most capable for complex writing tasks. Requires ~4GB RAM and longer download.",
    label: "Qwen2.5-1.5B-Instruct",
    modelId: "onnx-community/Qwen2.5-1.5B-Instruct-ONNX-MHA",
  },
  {
    description:
      "Lightweight writing assistant. Faster responses, decent quality for short text.",
    label: "SmolLM2-360M-Instruct",
    modelId: "onnx-community/SmolLM2-360M-Instruct-ONNX-MHA",
  },
  {
    description:
      "Fastest fallback. Best for simple rewrites and short selections.",
    label: "SmolLM2-135M-Instruct",
    modelId: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA",
  },
];
