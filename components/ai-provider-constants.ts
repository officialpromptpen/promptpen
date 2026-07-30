export interface AIProviderOption {
  id: string
  name: string
  group: string
}

export const ALL_PROVIDERS: AIProviderOption[] = [
  { id: "openai", name: "OpenAI", group: "Cloud Providers" },
  { id: "anthropic", name: "Anthropic", group: "Cloud Providers" },
  { id: "gemini", name: "Gemini", group: "Cloud Providers" },
  { id: "groq", name: "Groq", group: "Cloud Providers" },
  { id: "deepseek", name: "DeepSeek", group: "Cloud Providers" },
  { id: "mistral", name: "Mistral", group: "Cloud Providers" },
  { id: "cohere", name: "Cohere", group: "Cloud Providers" },
  { id: "openrouter", name: "OpenRouter", group: "OpenAI Compatible" },
  { id: "together", name: "Together AI", group: "OpenAI Compatible" },
  { id: "openai-compatible", name: "OpenAI Compatible", group: "OpenAI Compatible" },
  { id: "ollama", name: "Ollama", group: "Self-Hosted" },
  { id: "transformers", name: "Transformers.js", group: "Self-Hosted" },
]

export const CLOUD_PROVIDERS = ALL_PROVIDERS.filter(
  (p) => p.group === "Cloud Providers",
)

export const LOCAL_PROVIDERS = ALL_PROVIDERS.filter(
  (p) => p.group === "Self-Hosted",
)
