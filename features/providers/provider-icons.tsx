import type { SimpleIcon } from "simple-icons";
import {
  siAnthropic,
  siDeepseek,
  siGoogle,
  siMistralai,
  siOllama,
  siOpenrouter,
} from "simple-icons";
import type { AIProvider, ProviderIconProps } from "@/types";

type BrandIcon = SimpleIcon | null;

function getFallbackIcon(provider: AIProvider): BrandIcon {
  switch (provider) {
    case "groq":
      return null;
    case "together":
      return null;
    case "cohere":
      return null;
    case "openai-compatible":
      return null;
    default:
      return null;
  }
}

const PROVIDER_ICONS: Record<AIProvider, BrandIcon> = {
  anthropic: siAnthropic,
  cohere: null,
  deepseek: siDeepseek,
  gemini: siGoogle,
  groq: null,
  mistral: siMistralai,
  ollama: siOllama,
  openai: null,
  "openai-compatible": null,
  openrouter: siOpenrouter,
  together: null,
  transformers: null,
};

function initialsForProvider(provider: AIProvider): string {
  switch (provider) {
    case "openai-compatible":
      return "OC";
    case "openrouter":
      return "OR";
    case "together":
      return "TA";
    case "deepseek":
      return "DS";
    case "anthropic":
      return "AN";
    case "mistral":
      return "MI";
    case "gemini":
      return "G";
    case "groq":
      return "GR";
    case "cohere":
      return "CO";
    case "ollama":
      return "OL";
    case "transformers":
      return "TF";
    case "openai":
    default:
      return "AI";
  }
}

export function ProviderIcon({
  provider,
  className = "pp:size-4",
}: ProviderIconProps) {
  const icon = PROVIDER_ICONS[provider] ?? getFallbackIcon(provider);

  if (icon) {
    return (
      <svg
        aria-label={icon.title}
        className={className}
        role="img"
        style={{ fill: `#${icon.hex}` }}
        viewBox="0 0 24 24"
      >
        <path d={icon.path} />
      </svg>
    );
  }

  return (
    <span
      aria-label={provider}
      className={`${className} pp:inline-flex pp:items-center pp:justify-center pp:rounded-full pp:bg-muted pp:font-semibold pp:text-[10px] pp:text-foreground`}
      title={provider}
    >
      {initialsForProvider(provider)}
    </span>
  );
}
