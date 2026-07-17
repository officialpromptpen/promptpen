import {
  siAnthropic,
  siDeepseek,
  siGoogle,
  siMistralai,
  siOllama,
  siOpenrouter,
} from "simple-icons"
import type { SimpleIcon } from "simple-icons"
import type { AIProvider, ProviderIconProps } from "@/types"

type BrandIcon = SimpleIcon | null

function getFallbackIcon(provider: AIProvider): BrandIcon {
  switch (provider) {
    case "groq":
      return null
    case "together":
      return null
    case "cohere":
      return null
    case "openai-compatible":
      return null
    default:
      return null
  }
}

const PROVIDER_ICONS: Record<AIProvider, BrandIcon> = {
  openai: null,
  openrouter: siOpenrouter,
  anthropic: siAnthropic,
  gemini: siGoogle,
  groq: null,
  ollama: siOllama,
  together: null,
  cohere: null,
  deepseek: siDeepseek,
  mistral: siMistralai,
  "openai-compatible": null,
}

function initialsForProvider(provider: AIProvider): string {
  switch (provider) {
    case "openai-compatible":
      return "OC"
    case "openrouter":
      return "OR"
    case "together":
      return "TA"
    case "deepseek":
      return "DS"
    case "anthropic":
      return "AN"
    case "mistral":
      return "MI"
    case "gemini":
      return "G"
    case "groq":
      return "GR"
    case "cohere":
      return "CO"
    case "ollama":
      return "OL"
    case "openai":
    default:
      return "AI"
  }
}

export function ProviderIcon({ provider, className = "pp:size-4" }: ProviderIconProps) {
  const icon = PROVIDER_ICONS[provider] ?? getFallbackIcon(provider)

  if (icon) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        aria-label={icon.title}
        className={className}
        style={{ fill: `#${icon.hex}` }}
      >
        <path d={icon.path} />
      </svg>
    )
  }

  return (
    <span
      className={`${className} pp:inline-flex pp:items-center pp:justify-center pp:rounded-full pp:bg-muted pp:text-[10px] pp:font-semibold pp:text-foreground`}
      aria-label={provider}
      title={provider}
    >
      {initialsForProvider(provider)}
    </span>
  )
}