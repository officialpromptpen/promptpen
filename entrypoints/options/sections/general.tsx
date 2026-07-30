import { Separator } from "@/components/ui/separator"
import { AIProviderSelectDefault } from "@/components/ai-provider-select"
import {
  getProviderDefinition,
  CATEGORY_LABELS,
} from "@/features/providers/registry"
import { setDefaultProvider } from "@/features/providers/storage"
import type { AIProvider, OptionsState, ProviderCategory } from "@/types"

export function GeneralSection(state: OptionsState) {
  const configuredProviders = state.providerSummary?.configuredProviders ?? []

  const providerOptions = configuredProviders.map((id) => {
    const def = getProviderDefinition(id)
    return {
      id,
      name: def.label,
      group:
        CATEGORY_LABELS[
          def.category ?? ("openai-compatible" as ProviderCategory)
        ],
    }
  })

  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">General</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Configure your default preferences for PromptPen.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-5">
        <div className="pp:space-y-1.5">
          <label className="pp:text-sm pp:font-medium" htmlFor="default-provider">
            Default AI Provider
          </label>
          <p className="pp:text-xs pp:text-muted-foreground">
            Provider used when no specific provider is selected.
          </p>
          <AIProviderSelectDefault
            value={state.settings.defaultProvider ?? ""}
            providers={providerOptions}
            onValueChange={(provider) => {
              if (provider) {
                setDefaultProvider(provider as AIProvider)
              }
              state.setSettings((previous) => ({
                ...previous,
                defaultProvider: provider ? (provider as AIProvider) : null,
              }))
            }}
          />
        </div>
      </section>
    </div>
  )
}
