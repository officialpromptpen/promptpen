import { Brain, Check, Eye, Search, Star, StarOff, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProviderDefinition } from "@/features/providers/catalog"
import type { OptionsState } from "../hooks/use-options-state"
import { formatContext, formatPrice } from "../types"

export function ModelsSection(state: OptionsState) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Models</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse and manage available AI models.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={state.modelSearch}
          onChange={(event) => state.setModelSearch(event.target.value)}
          placeholder="Search models..."
          className="h-9 w-full rounded-md border bg-background px-9 text-sm"
        />
      </div>

      {state.selectedProviderForModels && (
        <div className="flex items-center justify-between rounded-lg border bg-accent/30 px-4 py-3">
          <p className="text-sm">
            Showing models for{" "}
            <span className="font-semibold">
              {getProviderDefinition(state.selectedProviderForModels).label}
            </span>
          </p>
          <button
            type="button"
            onClick={() => state.setSelectedProviderForModels(null)}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Show all models
          </button>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {state.selectedProviderForModels
            ? `${getProviderDefinition(state.selectedProviderForModels).label} Models (${state.displayModels.length})`
            : `All Models (${state.displayModels.length})`}
        </h2>
        <div className="space-y-2">
          {state.displayModels.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No models found for this provider.</p>
            </div>
          ) : (
            state.displayModels.map((model) => {
              const isFavorite = state.favoriteModelIds.includes(model.id)
              const isDefault = state.defaultModelId === model.id

              return (
                <div
                  key={model.id}
                  className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => state.toggleFavoriteModel(model.id)}
                    className="text-muted-foreground hover:text-yellow-500"
                  >
                    {isFavorite ? (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {model.provider} · {formatContext(model.contextWindow)} ctx ·{" "}
                      {formatPrice(model.inputPrice)} in / {formatPrice(model.outputPrice)} out
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    {model.supportsImages && <Eye className="h-3.5 w-3.5" />}
                    <Zap className="h-3.5 w-3.5" />
                    {model.supportsReasoning && <Brain className="h-3.5 w-3.5" />}
                  </div>

                  <Button
                    variant={isDefault ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => state.setDefaultModelId(isDefault ? null : model.id)}
                  >
                    {isDefault ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Default
                      </span>
                    ) : (
                      "Set Default"
                    )}
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
