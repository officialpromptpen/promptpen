import {
  CheckCircle2,
  Edit3,
  Loader2,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PROVIDER_DEFINITIONS, CATEGORY_LABELS, getProviderDefinition } from "@/features/providers/registry"
import { cn } from "@/lib/utils"
import type { OptionsState, ProviderCategory } from "@/types"

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

function formatDate(timestamp: number): string {
  return DATE_FORMATTER.format(new Date(timestamp))
}

export function AIProvidersSection(state: OptionsState) {
  const [deleteConfirmProvider, setDeleteConfirmProvider] = useState<string | null>(null)

  return (
    <div className="pp:mx-auto pp:max-w-4xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">AI Providers</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Manage your AI provider API keys and configuration.
        </p>
      </div>

      <div className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
        <div className="pp:mb-6">
          <div className="pp:flex pp:items-center pp:justify-between pp:gap-3">
            <h2 className="pp:text-lg pp:font-semibold">Provider Setup</h2>
            {(() => {
              const cloudUnconfigured = state.providerSummary
                ? state.providerSummary.unconfiguredProviders.filter(
                    (p) => getProviderDefinition(p).category !== "self-hosted",
                  ).length
                : 0
              return (
                <span
                  className={
                    cloudUnconfigured > 0
                      ? "pp:rounded-full pp:border pp:border-red-500/30 pp:bg-red-500/10 pp:px-2.5 pp:py-1 pp:text-xs pp:font-medium pp:text-red-600"
                      : "pp:rounded-full pp:border pp:border-green-500/30 pp:bg-green-500/10 pp:px-2.5 pp:py-1 pp:text-xs pp:font-medium pp:text-green-600"
                  }
                >
                  {cloudUnconfigured > 0
                    ? `${cloudUnconfigured} not configured`
                    : "All configured"}
                </span>
              )
            })()}
          </div>
          <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
            Select a provider and enter your API key to get started.
          </p>
        </div>

        <div id="pp-tour-provider-list" className="pp:grid pp:gap-4 sm:pp:grid-cols-2">
          <label className="pp:space-y-1.5">
            <span className="pp:text-sm pp:font-medium">Provider</span>
            <select
              value={state.selectedProvider}
              onChange={(event) => state.selectProvider(event.target.value as never)}
              className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
            >
              {PROVIDER_DEFINITIONS.filter((p) => p.category !== "self-hosted").reduce(
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
          </label>

          <label id="pp-tour-model-field" className="pp:space-y-1.5">
            <span className="pp:text-sm pp:font-medium">Model</span>
            <input
              value={state.providerModel}
              onChange={(event) => state.setProviderModel(event.target.value)}
              className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
              placeholder={state.selectedProviderDefinition.defaultModel}
            />
          </label>
        </div>

        <label id="pp-tour-api-key-field" className="pp:mt-4 pp:block pp:space-y-1.5">
          <span className="pp:text-sm pp:font-medium">
            API Key{" "}
            <span className="pp:text-muted-foreground">
              ({state.selectedProviderDefinition.label})
            </span>
          </span>
          <input
            type="password"
            value={state.apiKey}
            onChange={(event) => state.setApiKey(event.target.value)}
            className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
            placeholder={
              state.hasStoredApiKey ? "Leave empty to keep existing key" : "Paste your API key"
            }
          />
        </label>

        <div className="pp:mt-6 pp:flex pp:flex-wrap pp:items-center pp:gap-3">
          <Button
            id="pp-tour-save-btn"
            onClick={state.handleSaveProvider}
            disabled={state.isSavingProvider || !state.connectionVerified}
            className="pp:gap-2"
          >
            {state.isSavingProvider && <Loader2 className="pp:h-4 pp:w-4 pp:animate-spin" />}
            Save provider
          </Button>
          <Button
            id="pp-tour-test-btn"
            variant="outline"
            onClick={state.handleTestProvider}
            disabled={state.isTestingProvider}
            className="pp:gap-2"
          >
            {state.isTestingProvider && <Loader2 className="pp:h-4 pp:w-4 pp:animate-spin" />}
            Test connection
          </Button>
          {!state.connectionVerified && state.providerStatusType === "idle" && (
            <span className="pp:text-xs pp:text-muted-foreground">Test the connection before saving</span>
          )}
        </div>

        {state.providerStatusType !== "idle" && (
          <div
            className={cn(
              "pp:mt-4 pp:flex pp:items-center pp:gap-2 pp:rounded-md pp:border pp:px-3 pp:py-2 pp:text-sm",
              state.providerStatusType === "success"
                ? "pp:border-green-500/30 pp:bg-green-500/10 pp:text-green-700 pp:dark:text-green-300"
                : "pp:border-destructive/40 pp:bg-destructive/10 pp:text-destructive",
            )}
          >
            {state.providerStatusType === "success" ? (
              <CheckCircle2 className="pp:h-4 pp:w-4 pp:shrink-0" />
            ) : (
              <TriangleAlert className="pp:h-4 pp:w-4 pp:shrink-0" />
            )}
            <span>{state.providerStatusMessage}</span>
          </div>
        )}

        <div className="pp:mt-6 pp:flex pp:items-center pp:justify-between pp:border-t pp:pt-4">
          <div className="pp:flex pp:items-center pp:gap-2 pp:text-sm pp:text-muted-foreground">
            <Sparkles className="pp:h-4 pp:w-4" />
            <span>
              Configured:{" "}
              <span className="pp:font-medium pp:text-foreground">
                {state.providerSummary?.configuredProviders.length ?? 0}
              </span>{" "}
              / {PROVIDER_DEFINITIONS.filter((p) => p.category !== "self-hosted").length} providers
            </span>
          </div>
        </div>
      </div>

      {state.configuredProviderDetails.length > 0 && (
        <div id="pp-tour-provider-setup" className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
          <h2 className="pp:mb-1 pp:text-lg pp:font-semibold">
            Configured Providers
            <span className="pp:ml-2 pp:text-sm pp:font-normal pp:text-muted-foreground">
              ({state.configuredProviderDetails.length})
            </span>
          </h2>
          <p className="pp:mb-4 pp:text-sm pp:text-muted-foreground">
            Click Edit to modify the model or API key, or Delete to remove the configuration.
          </p>

          <div className="pp:space-y-2">
            {state.configuredProviderDetails.map((detail) => {
              const isPendingDelete = deleteConfirmProvider === detail.provider
              const isCurrentlySelected = detail.provider === state.selectedProvider
              return (
                <div
                  key={detail.provider}
                  className={cn(
                    "pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:px-4 pp:py-3 pp:transition-colors",
                    isCurrentlySelected ? "pp:border-primary/40 pp:bg-primary/5" : "pp:bg-card",
                  )}
                >
                  <div className="pp:flex pp:items-center pp:gap-3 pp:min-w-0">
                    <div className="pp:flex pp:size-8 pp:items-center pp:justify-center pp:rounded-full pp:bg-primary/10 pp:shrink-0">
                      <Sparkles className="pp:size-4 pp:text-primary" aria-hidden="true" />
                    </div>
                    <div className="pp:flex pp:flex-col pp:gap-0.5 pp:min-w-0">
                      <div className="pp:flex pp:items-center pp:gap-2">
                        <span className="pp:text-sm pp:font-medium pp:text-foreground">{detail.label}</span>
                        {isCurrentlySelected && (
                          <span className="pp:rounded-full pp:bg-primary/10 pp:px-1.5 pp:py-0.5 pp:text-[9px] pp:font-medium pp:text-primary">
                            Editing
                          </span>
                        )}
                      </div>
                      <span className="pp:truncate pp:text-xs pp:text-muted-foreground">
                        {detail.model} &middot; Updated {formatDate(detail.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {isPendingDelete ? (
                    <div className="pp:flex pp:items-center pp:gap-1.5 pp:shrink-0 pp:ml-2">
                      <Button
                        variant={"destructive"}
                        aria-label={`Delete ${detail.label}`}
                        title={`Delete ${detail.label}`}
                        className="pp:rounded-xs"
                        onClick={async () => {
                          setDeleteConfirmProvider(null)
                          await state.handleDeleteProvider(detail.provider)
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant={"outline"}
                        aria-label={`Delete ${detail.label}`}
                        title={`Delete ${detail.label}`}
                        className="pp:rounded-xs"
                        onClick={() => setDeleteConfirmProvider(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="pp:flex pp:items-center pp:gap-1.5 pp:shrink-0 pp:ml-2">
                      <Button
                        type="button"
                        variant={"ghost"}
                        aria-label={`Edit ${detail.label}`}
                        title={`Edit ${detail.label}`}
                        onClick={() => {
                          state.handleEditProvider(detail.provider)
                          setDeleteConfirmProvider(null)
                        }}
                      >
                        <Edit3 className="pp:size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant={"ghost"}
                        aria-label={`Delete ${detail.label}`}
                        title={`Delete ${detail.label}`}
                        onClick={() => setDeleteConfirmProvider(detail.provider)}
                      >
                        <Trash2 className="pp:size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
