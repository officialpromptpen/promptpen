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
import { PROVIDER_DEFINITIONS } from "@/features/providers/catalog"
import { cn } from "@/lib/utils"
import type { OptionsState } from "../hooks/use-options-state"

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
    <div className="mx-auto max-w-4xl space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Providers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your AI provider API keys and configuration.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Provider Setup</h2>
            <span
              className={
                state.unconfiguredProviders > 0
                  ? "rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600"
                  : "rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600"
              }
            >
              {state.unconfiguredProviders > 0
                ? `${state.unconfiguredProviders} not configured`
                : "All configured"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a provider and enter your API key to get started.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Provider</span>
            <select
              value={state.selectedProvider}
              onChange={(event) => state.setSelectedProvider(event.target.value as never)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              {PROVIDER_DEFINITIONS.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium">Model</span>
            <input
              value={state.providerModel}
              onChange={(event) => state.setProviderModel(event.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              placeholder={state.selectedProviderDefinition.defaultModel}
            />
          </label>
        </div>

        <label className="mt-4 block space-y-1.5">
          <span className="text-sm font-medium">
            API Key{" "}
            <span className="text-muted-foreground">
              ({state.selectedProviderDefinition.label})
            </span>
          </span>
          <input
            type="password"
            value={state.apiKey}
            onChange={(event) => state.setApiKey(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            placeholder={
              state.hasStoredApiKey ? "Leave empty to keep existing key" : "Paste your API key"
            }
          />
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            onClick={state.handleSaveProvider}
            disabled={state.isSavingProvider || !state.connectionVerified}
            className="gap-2"
          >
            {state.isSavingProvider && <Loader2 className="h-4 w-4 animate-spin" />}
            Save provider
          </Button>
          <Button
            variant="outline"
            onClick={state.handleTestProvider}
            disabled={state.isTestingProvider}
            className="gap-2"
          >
            {state.isTestingProvider && <Loader2 className="h-4 w-4 animate-spin" />}
            Test connection
          </Button>
          {!state.connectionVerified && state.providerStatusType === "idle" && (
            <span className="text-xs text-muted-foreground">Test the connection before saving</span>
          )}
        </div>

        {state.providerStatusType !== "idle" && (
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              state.providerStatusType === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
                : "border-destructive/40 bg-destructive/10 text-destructive",
            )}
          >
            {state.providerStatusType === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <TriangleAlert className="h-4 w-4 shrink-0" />
            )}
            <span>{state.providerStatusMessage}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>
              Configured:{" "}
              <span className="font-medium text-foreground">
                {state.providerSummary?.configuredProviders.length ?? 0}
              </span>{" "}
              / {PROVIDER_DEFINITIONS.length} providers
            </span>
          </div>
        </div>
      </div>

      {state.configuredProviderDetails.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">
            Configured Providers
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({state.configuredProviderDetails.length})
            </span>
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            View, edit, or remove your configured AI providers.
          </p>

          <div className="space-y-2">
            {state.configuredProviderDetails.map((detail) => {
              const isPendingDelete = deleteConfirmProvider === detail.provider
              const isCurrentlySelected = detail.provider === state.selectedProvider
              return (
                <div
                  key={detail.provider}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                    isCurrentlySelected ? "border-primary/40 bg-primary/5" : "bg-card",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Sparkles className="size-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{detail.label}</span>
                        {isCurrentlySelected && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                            Editing
                          </span>
                        )}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {detail.model} &middot; Updated {formatDate(detail.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {isPendingDelete ? (
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setDeleteConfirmProvider(null)
                          await state.handleDeleteProvider(detail.provider)
                        }}
                        className="rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmProvider(null)}
                        className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => void state.handleEditProvider(detail.provider)}
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground/60 hover:bg-accent hover:text-accent-foreground"
                      >
                        <Edit3 className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Edit {detail.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmProvider(detail.provider)}
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground/60 hover:bg-accent hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Delete {detail.label}</span>
                      </button>
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
