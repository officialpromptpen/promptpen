export interface RecommendedModel {
  description: string;
  label: string;
  modelId: string;
}

export const RECOMMENDED_MODELS: RecommendedModel[] = [
  {
    description:
      "Balanced quality and speed for writing tasks. Good instruction following.",
    label: "Qwen2.5-0.5B-Instruct-ONNX-MHA",
    modelId: "onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA",
  },
  {
    description:
      "Fastest fallback. Best for simple rewrites and short selections.",
    label: "SmolLM2-135M-Instruct-ONNX-MHA",
    modelId: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA",
  },
];
