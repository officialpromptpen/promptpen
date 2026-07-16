import { Button } from "@/components/ui/button"
import { FloatingDelayGroup } from "@floating-ui/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ACTION_CATEGORY_LABELS,
  ACTION_CATEGORY_ORDER,
  actions,
} from "@/constants/actions"
import { getProviderDefinition, PROVIDER_DEFINITIONS } from "@/features/providers/catalog"
import { ProviderIcon } from "@/features/providers/provider-icons"
import { getCustomPrompts, type CustomPromptDefinition } from "@/features/storage/custom-prompts"
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { type AIProvider, type ToolbarActionsProps } from "@/types"
import { ChevronDown, Loader2, Search, Sparkles, WandSparkles, X } from "lucide-react"

type ToolbarCategory = "all" | (typeof ACTION_CATEGORY_ORDER)[number] | "custom-prompt"

export function ToolbarActions({
  onAction,
  onRunCustomPrompt,
  onProviderChange,
  selectedProvider,
  selectedModel,
  configuredProviders,
  configuredProviderModels,
  isLoading = false,
  activeActionId = null,
  enabledActionIds,
}: ToolbarActionsProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [activeCategory, setActiveCategory] = useState<ToolbarCategory>("all")
  const [customPrompts, setCustomPrompts] = useState<CustomPromptDefinition[]>([])
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false)
  const providerMenuRef = useRef<HTMLDivElement | null>(null)

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent, actionId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onAction(actionId)
      }
    },
    [onAction],
  )

  const enabledSet = useMemo(
    () => (enabledActionIds ? new Set(enabledActionIds) : null),
    [enabledActionIds],
  )

  const availableProviders = useMemo(
    () =>
      PROVIDER_DEFINITIONS.filter((provider) =>
        configuredProviders?.includes(provider.id),
      ),
    [configuredProviders],
  )

  const selectedProviderDefinition = getProviderDefinition(selectedProvider)
  const selectedProviderTitleModel =
    selectedModel ||
    configuredProviderModels?.[selectedProvider] ||
    selectedProviderDefinition.defaultModel
  const canSwitchProviders = availableProviders.length > 1

  useEffect(() => {
    let mounted = true

    async function hydrateCustomPrompts() {
      const prompts = await getCustomPrompts()
      if (!mounted) return
      setCustomPrompts(prompts)
    }

    void hydrateCustomPrompts()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!providerMenuRef.current?.contains(event.target as Node)) {
        setIsProviderMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProviderMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const searchableActions = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()

    return actions.filter((action) => {
      if (enabledSet && !enabledSet.has(action.id)) {
        return false
      }

      if (activeCategory === "custom-prompt") {
        return false
      }

      if (activeCategory !== "all" && action.category !== activeCategory) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return (
        action.label.toLowerCase().includes(normalizedQuery) ||
        action.prompt.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [enabledSet, activeCategory, searchValue])

  const groupedActions = useMemo(
    () =>
      ACTION_CATEGORY_ORDER.map((category) => ({
        category,
        items: searchableActions.filter((action) => action.category === category),
      })).filter((group) => group.items.length > 0),
    [searchableActions],
  )

  const searchableCustomPrompts = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()

    if (!normalizedQuery) {
      return customPrompts
    }

    return customPrompts.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.prompt.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [customPrompts, searchValue])

  const toolbarCategories = useMemo(
    () => [
      { id: "all" as const, label: "All" },
      ...ACTION_CATEGORY_ORDER.map((category) => ({
        id: category,
        label: ACTION_CATEGORY_LABELS[category],
      })),
      { id: "custom-prompt" as const, label: "Custom Prompt" },
    ],
    [],
  )

  if (actions.length === 0) return null

  if (!isPanelOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label="Open PromptPen actions"
                onClick={() => setIsPanelOpen(true)}
                variant="outline"
                size="icon"
                className="pp:rounded-md pp:border-border/70 pp:bg-popover pp:shadow-md pp:hover:bg-accent"
              >
                <WandSparkles className="pp:size-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom" align="center">
            Open actions
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <FloatingDelayGroup delay={150}>
      <div
        className="pp:w-[min(64vw,564px)] pp:max-h-[80vh] pp:overflow-hidden pp:rounded-xl pp:border pp:border-border/70 pp:bg-popover pp:text-popover-foreground pp:shadow-2xl"
        aria-label="PromptPen action panel"
      >
        <div className="pp:flex  pp:flex-row pp:px-2.5 pp:justify-between pp:items-center pp:gap-3 pp:border-b pp:border-border pp:py-3">
          
          <div className="pp:flex pp:items-center pp:gap-2 pp:text-sm pp:font-semibold">
            <Sparkles className="pp:size-4" />
            PromptPen Actions
          </div>

          <div className="pp:ml-auto pp:flex pp:items-center pp:gap-2">
            {availableProviders.length > 0 && (
              <div className="pp:relative" ref={providerMenuRef}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        aria-label={`Select AI provider: ${selectedProviderDefinition.label}`}
                        aria-expanded={isProviderMenuOpen}
                        aria-haspopup="menu"
                        disabled={isLoading}
                        variant="outline"
                        size="icon-sm"
                        title={`${selectedProviderDefinition.label} · ${selectedProviderTitleModel}`}
                        onClick={() => {
                          if (!canSwitchProviders) {
                            return
                          }
                          setIsProviderMenuOpen((current) => !current)
                        }}
                        className="pp:rounded-md pp:border-border/70 pp:bg-background"
                      >
                        <ProviderIcon provider={selectedProvider} className="pp:size-4" />
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom" align="center">
                    {selectedProviderDefinition.label} · {selectedProviderTitleModel}
                  </TooltipContent>
                </Tooltip>

                {isProviderMenuOpen && canSwitchProviders && (
                  <div className="pp:absolute pp:right-0 pp:top-[calc(100%+8px)] pp:z-50 pp:min-w-56 pp:rounded-xl pp:border pp:border-border/70 pp:bg-red-600 pp:p-1 pp:shadow-xl">
                    {availableProviders.map((provider) => {
                      const isSelected = provider.id === selectedProvider

                      return (
                        <button
                          key={provider.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={isSelected}
                          onClick={() => {
                            onProviderChange(provider.id)
                            setIsProviderMenuOpen(false)
                          }}
                          className={[
                            "pp:flex pp:w-full pp:items-center pp:gap-3 pp:rounded-lg pp:px-3 pp:py-2 pp:text-left pp:text-sm pp:transition-colors",
                            isSelected
                              ? "pp:bg-accent pp:text-accent-foreground"
                              : "hover:pp:bg-accent/60",
                          ].join(" ")}
                        >
                          <ProviderIcon provider={provider.id} className="pp:size-4 pp:shrink-0" />
                          <span className="pp:flex-1">{provider.label}</span>
                          {isSelected && <ChevronDown className="pp:size-3.5 pp:rotate-180 pp:text-muted-foreground" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <Button
              aria-label="Close action panel"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsPanelOpen(false)}
            >
              <X className="pp:size-4" />
            </Button>
          </div>
        </div>

        <div className="pp:p-4">
          <div className="pp:space-y-3">
            <div className="pp:relative">
              <Search className="pp:pointer-events-none pp:absolute pp:left-3 pp:top-1/2 pp:size-3.5 pp:-translate-y-1/2 pp:text-muted-foreground" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search actions"
                className="pp:w-full pp:rounded-md pp:border pp:border-input pp:bg-background pp:py-2 pp:pr-3 pp:pl-8 pp:text-sm pp:outline-none pp:focus-visible:border-ring pp:focus-visible:ring-2 pp:focus-visible:ring-ring/40"
              />
            </div>

            <div className="pp:flex pp:my-2.5 pp:flex-wrap pp:gap-1.5">
              {toolbarCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {activeCategory !== "custom-prompt" ? (
              <div className="pp:max-h-[52vh] pp:space-y-4 pp:overflow-auto pp:pr-1">
                {groupedActions.length === 0 ? (
                  <p className="pp:rounded-md pp:bg-muted/60 pp:p-3 pp:text-sm pp:text-muted-foreground">
                    No actions matched your search.
                  </p>
                ) : (
                  groupedActions.map((group) => (
                    <section key={group.category} className="pp:space-y-1.5">
                      <h3 className="pp:px-1 pp:text-xs pp:font-semibold pp:tracking-wide pp:text-muted-foreground pp:uppercase">
                        {ACTION_CATEGORY_LABELS[group.category]}
                      </h3>

                      {group.items.map((action) => {
                        const Icon = action.icon
                        const isCurrent = isLoading && activeActionId === action.id

                        return (
                          <Button
                            key={action.id}
                            aria-label={action.label}
                            tabIndex={0}
                            onClick={() => onAction(action.id)}
                            onKeyDown={(event) => handleKeyDown(event, action.id)}
                            disabled={isLoading}
                            variant="ghost"
                            size="default"
                            className="pp:w-full pp:justify-start pp:gap-2 pp:rounded-md pp:px-2"
                          >
                            {isCurrent ? (
                              <Loader2 className="pp:size-3.5 pp:shrink-0 pp:animate-spin" />
                            ) : (
                              <Icon className="pp:size-3.5 pp:shrink-0" />
                            )}
                            <span className="pp:flex-1 pp:text-left">{action.label}</span>
                          </Button>
                        )
                      })}
                    </section>
                  ))
                )}
              </div>
            ) : (
              <div className="pp:max-h-[52vh] pp:space-y-3 pp:overflow-auto pp:pr-1">
                {searchableCustomPrompts.length === 0 ? (
                  <div className="pp:rounded-md pp:border pp:border-dashed pp:bg-background/70 pp:p-4 pp:text-sm pp:text-muted-foreground">
                    No custom prompts saved yet. Add them from Dashboard &gt; Custom Prompts.
                  </div>
                ) : (
                  searchableCustomPrompts.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="default"
                      className="pp:w-full pp:justify-start pp:gap-2 pp:rounded-md pp:px-2"
                      disabled={isLoading}
                      onClick={() => onRunCustomPrompt(item.prompt)}
                    >
                      <WandSparkles className="pp:size-3.5 pp:shrink-0" />
                      <span className="pp:flex-1 pp:text-left">{item.title}</span>
                    </Button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </FloatingDelayGroup>
  )
}
