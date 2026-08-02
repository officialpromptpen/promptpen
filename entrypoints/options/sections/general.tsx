import { AIProviderSelectDefault } from "@/components/ai-provider-select";
import { Separator } from "@/components/ui/separator";
import {
  CATEGORY_LABELS,
  getProviderDefinition,
} from "@/features/providers/registry";
import { setDefaultProvider } from "@/features/providers/storage";
import type { AIProvider, OptionsState, ProviderCategory } from "@/types";

export function GeneralSection(state: OptionsState) {
  const configuredProviders = state.providerSummary?.configuredProviders ?? [];

  const providerOptions = configuredProviders.map((id) => {
    const def = getProviderDefinition(id);
    return {
      group:
        CATEGORY_LABELS[
          def.category ?? ("openai-compatible" as ProviderCategory)
        ],
      id,
      name: def.label,
    };
  });

  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:font-semibold pp:text-2xl pp:tracking-tight">
          General
        </h1>
        <p className="pp:mt-1 pp:text-muted-foreground pp:text-sm">
          Configure your default preferences for PromptPen.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-5">
        <div className="pp:space-y-1.5">
          <label
            className="pp:font-medium pp:text-sm"
            htmlFor="default-provider"
          >
            Default AI Provider
          </label>
          <p className="pp:text-muted-foreground pp:text-xs">
            Provider used when no specific provider is selected.
          </p>
          <AIProviderSelectDefault
            onValueChange={(provider) => {
              if (provider) {
                setDefaultProvider(provider as AIProvider);
              }
              state.setSettings((previous) => ({
                ...previous,
                defaultProvider: provider ? (provider as AIProvider) : null,
              }));
            }}
            providers={providerOptions}
            value={state.settings.defaultProvider ?? ""}
          />
        </div>
      </section>
    </div>
  );
}
