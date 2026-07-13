import { Separator } from "@/components/ui/separator"
import { PROVIDER_DEFINITIONS } from "@/features/providers/catalog"
import type { OptionsState } from "../hooks/use-options-state"

export function GeneralSection(state: OptionsState) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">General</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your default preferences for PromptPen.
        </p>
      </div>

      <Separator />

      <section className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="default-provider">
            Default AI Provider
          </label>
          <p className="text-xs text-muted-foreground">
            Provider used when no specific provider is selected.
          </p>
          <select
            id="default-provider"
            value={state.settings.defaultProvider ?? ""}
            onChange={(event) =>
              state.setSettings((previous) => ({
                ...previous,
                defaultProvider: (event.target.value || null) as never,
              }))
            }
            className="h-9 w-56 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">None (auto-select)</option>
            {PROVIDER_DEFINITIONS.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.label}
              </option>
            ))}
          </select>
        </div>
      </section>
    </div>
  )
}
