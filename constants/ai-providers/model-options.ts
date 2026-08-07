import type { AIProvider } from "@/types";

export interface ModelOption {
  label: string;
  value: string;
}

export const TRANSFORMERS_MODEL_CHOICES: ModelOption[] = [
  {
    label: "SmolLM2-135M-Instruct-ONNX-MHA",
    value: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA",
  },
  {
    label: "SmolLM2-360M-Instruct",
    value: "onnx-community/SmolLM2-360M-Instruct",
  },
  {
    label: "Qwen2.5-0.5B-Instruct-ONNX-MHA",
    value: "onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA",
  },
  {
    label: "Qwen2.5-1.5B-Instruct",
    value: "onnx-community/Qwen2.5-1.5B-Instruct",
  },
];

export const OPENAI_MODEL_CHOICES: ModelOption[] = [
  { label: "GPT-4o mini", value: "gpt-4o-mini" },
  { label: "GPT-4.1 mini", value: "gpt-4.1-mini" },
  { label: "GPT-4o", value: "gpt-4o" },
];

export const OPENROUTER_MODEL_CHOICES: ModelOption[] = [
  { label: "OpenAI GPT-4o mini", value: "openai/gpt-4o-mini" },
  {
    label: "Anthropic Claude 3.5 Sonnet",
    value: "anthropic/claude-3.5-sonnet",
  },
  {
    label: "Qwen 2.5 0.5B Instruct",
    value: "qwen/qwen-2.5-0.5b-instruct",
  },
];

export const PROVIDER_MODEL_PRESETS: Partial<
  Record<AIProvider, ModelOption[]>
> = {
  openai: OPENAI_MODEL_CHOICES,
  openrouter: OPENROUTER_MODEL_CHOICES,
  transformers: TRANSFORMERS_MODEL_CHOICES,
};
