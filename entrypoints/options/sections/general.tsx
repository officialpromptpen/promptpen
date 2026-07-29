import { Separator } from "@/components/ui/separator"
import { PROVIDER_DEFINITIONS, CATEGORY_LABELS } from "@/features/providers/registry"
import type { OptionsState, ProviderCategory } from "@/types"

export function GeneralSection(state: OptionsState) {
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
          <select
            id="default-provider"
            value={state.settings.defaultProvider ?? ""}
            onChange={(event) =>
              state.setSettings((previous) => ({
                ...previous,
                defaultProvider: (event.target.value || null) as never,
              }))
            }
            className="pp:h-9 pp:w-56 pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
          >
            <option value="">None (auto-select)</option>
            {PROVIDER_DEFINITIONS.reduce(
              (groups, p) => {
                const cat = (p.category ?? "openai-compatible") as ProviderCategory
                const key = CATEGORY_LABELS[cat]
                const existing = groups.find((g) => g.key === key)
                if (existing) {
                  existing.providers.push(p)
                } else {
                  groups.push({ key, label: key, providers: [p] })
                }
                return groups
              },
              [] as Array<{ key: string; label: string; providers: typeof PROVIDER_DEFINITIONS }>,
            ).map((group) => (
              <optgroup key={group.key} label={group.label}>
                {group.providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </section>
    </div>
  )
}
