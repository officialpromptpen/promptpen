import { Separator } from "@/components/ui/separator"
import { PROVIDER_DEFINITIONS } from "@/features/providers/catalog"
import type { OptionsState } from "../hooks/use-options-state"
import { languages } from "../types"

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
          <label className="text-sm font-medium" htmlFor="language">
            Language
          </label>
          <p className="text-xs text-muted-foreground">Interface language for PromptPen.</p>
          <select
            id="language"
            value={state.settings.language}
            onChange={(event) =>
              state.setSettings((previous) => ({ ...previous, language: event.target.value }))
            }
            className="h-9 w-48 rounded-md border bg-background px-3 text-sm"
          >
            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

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

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="default-model">
            Default Model
          </label>
          <p className="text-xs text-muted-foreground">Fallback model used for writing actions.</p>
          <select
            id="default-model"
            value={state.defaultModelId ?? ""}
            onChange={(event) => {
              const value = event.target.value || null
              state.setDefaultModelId(value)
              state.setSettings((previous) => ({ ...previous, defaultModel: value }))
            }}
            className="h-9 w-64 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">None (use provider default)</option>
            {state.models.slice(0, 30).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <Separator />

      <section className="space-y-5">
        <h2 className="text-lg font-medium">Generation Defaults</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Streaming</p>
            <p className="text-xs text-muted-foreground">Enable real-time model responses.</p>
          </div>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={state.settings.streamingEnabled}
            onChange={(event) =>
              state.setSettings((previous) => ({
                ...previous,
                streamingEnabled: event.target.checked,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">
            Temperature: {state.settings.defaultTemperature.toFixed(1)}
          </p>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={state.settings.defaultTemperature}
            onChange={(event) =>
              state.setSettings((previous) => ({
                ...previous,
                defaultTemperature: Number(event.target.value),
              }))
            }
            className="w-56"
          />
          <p className="text-xs text-muted-foreground">
            Lower values are more deterministic, higher values are more creative.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Max Tokens</span>
            <input
              type="number"
              value={state.settings.defaultMaxTokens}
              onChange={(event) =>
                state.setSettings((previous) => ({
                  ...previous,
                  defaultMaxTokens: Number(event.target.value),
                }))
              }
              className="h-9 w-32 rounded-md border bg-background px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium">Timeout (ms)</span>
            <input
              type="number"
              value={state.settings.defaultTimeout}
              onChange={(event) =>
                state.setSettings((previous) => ({
                  ...previous,
                  defaultTimeout: Number(event.target.value),
                }))
              }
              className="h-9 w-32 rounded-md border bg-background px-3 text-sm"
            />
          </label>
        </div>
      </section>

      <Separator />

      <section className="space-y-5">
        <h2 className="text-lg font-medium">Suggestions & Exclusions</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto Suggest</p>
            <p className="text-xs text-muted-foreground">Show helpful suggestions as you type.</p>
          </div>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={state.settings.autoSuggest}
            onChange={(event) =>
              state.setSettings((previous) => ({ ...previous, autoSuggest: event.target.checked }))
            }
          />
        </div>

        <label className="space-y-1.5 block">
          <span className="text-sm font-medium">Excluded Sites</span>
          <textarea
            className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="*.example.com, mail.google.com"
            value={state.settings.excludedSites.join(", ")}
            onChange={(event) =>
              state.setSettings((previous) => ({
                ...previous,
                excludedSites: event.target.value
                  .split(",")
                  .map((site) => site.trim())
                  .filter(Boolean),
              }))
            }
          />
        </label>
      </section>
    </div>
  )
}
