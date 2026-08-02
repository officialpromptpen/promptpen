import { FloatingDelayGroup } from "@floating-ui/react";
import { Search, X } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AIProviderSelectIcon } from "@/components/ai-provider-select-icon";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  ACTION_CATEGORY_LABELS,
  ACTION_CATEGORY_ORDER,
  actions,
} from "@/constants/actions";
import {
  CATEGORY_LABELS,
  getProviderDefinition,
} from "@/features/providers/registry";
import { setDefaultProvider } from "@/features/providers/storage";
import { getCustomPrompts } from "@/features/storage/custom-prompts";
import type {
  AIProvider,
  CustomPromptDefinition,
  ProviderCategory,
  ToolbarActionsProps,
  ToolbarCategory,
} from "@/types";
import { ActionGroupList } from "./action-group-list";
import { CategoryFilterBar } from "./category-filter-bar";
import { ClosedToolbarState } from "./closed-toolbar-state";
import { CustomPromptList } from "./custom-prompt-list";

const TOOLBAR_CATEGORIES = [
  { id: "all" as const, label: "All" },
  ...ACTION_CATEGORY_ORDER.map((category) => ({
    id: category,
    label: ACTION_CATEGORY_LABELS[category],
  })),
  { id: "custom-prompt" as const, label: "Custom Prompt" },
];

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
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolbarCategory>("all");
  const [customPrompts, setCustomPrompts] = useState<CustomPromptDefinition[]>(
    []
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent, actionId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onAction(actionId);
      }
    },
    [onAction]
  );

  const enabledSet = useMemo(
    () => (enabledActionIds ? new Set(enabledActionIds) : null),
    [enabledActionIds]
  );

  const providerOptions = useMemo(
    () =>
      (configuredProviders ?? []).map((id) => {
        const def = getProviderDefinition(id);
        return {
          group:
            CATEGORY_LABELS[
              def.category ?? ("openai-compatible" as ProviderCategory)
            ],
          id,
          name: def.label,
        };
      }),
    [configuredProviders]
  );

  useEffect(() => {
    let mounted = true;
    async function hydrateCustomPrompts() {
      const prompts = await getCustomPrompts();
      if (!mounted) {
        return;
      }
      setCustomPrompts(prompts);
    }
    void hydrateCustomPrompts();
    return () => {
      mounted = false;
    };
  }, []);

  const searchableActions = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    return actions.filter((action) => {
      if (enabledSet && !enabledSet.has(action.id)) {
        return false;
      }

      if (activeCategory === "custom-prompt") {
        return false;
      }

      if (activeCategory !== "all" && action.category !== activeCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        action.label.toLowerCase().includes(normalizedQuery) ||
        action.prompt.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [enabledSet, activeCategory, searchValue]);

  const groupedActions = useMemo(() => {
    const groups: Array<{
      category: (typeof ACTION_CATEGORY_ORDER)[number];
      items: typeof searchableActions;
    }> = [];
    for (const category of ACTION_CATEGORY_ORDER) {
      const items = searchableActions.filter(
        (action) => action.category === category
      );
      if (items.length > 0) {
        groups.push({ category, items });
      }
    }
    return groups;
  }, [searchableActions]);

  const searchableCustomPrompts = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return customPrompts;
    }

    return customPrompts.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.prompt.toLowerCase().includes(normalizedQuery)
    );
  }, [customPrompts, searchValue]);

  const toolbarCategories = TOOLBAR_CATEGORIES;

  if (actions.length === 0) {
    return null;
  }

  if (!isPanelOpen) {
    return <ClosedToolbarState onOpen={() => setIsPanelOpen(true)} />;
  }

  return (
    <FloatingDelayGroup delay={150}>
      <div
        aria-label="PromptPen action panel"
        className="pp:max-h-[80vh] pp:w-[min(64vw,564px)] pp:overflow-hidden pp:rounded-xl pp:border pp:border-border/70 pp:bg-popover pp:text-popover-foreground pp:shadow-2xl"
      >
        <div className="pp:flex pp:flex-row pp:items-center pp:justify-between pp:gap-3 pp:border-border pp:border-b pp:px-2.5 pp:py-3">
          <div className="pp:flex pp:items-center pp:gap-2">
            <div className="pp:flex pp:size-7 pp:items-center pp:justify-center pp:rounded-lg">
              <Logo />
            </div>
            <span className="pp:font-semibold pp:text-sm">
              PromptPen Actions
            </span>
          </div>

          <div className="pp:ml-auto pp:flex pp:items-center pp:gap-2">
            <AIProviderSelectIcon
              disabled={isLoading}
              onValueChange={(provider) => {
                if (!provider) {
                  return;
                }
                setDefaultProvider(provider as AIProvider);
                onProviderChange(provider as AIProvider);
              }}
              providers={providerOptions}
              value={selectedProvider}
            />

            <Button
              aria-label="Close action panel"
              onClick={() => setIsPanelOpen(false)}
              size="icon-sm"
              variant="ghost"
            >
              <X className="pp:size-4" />
            </Button>
          </div>
        </div>

        <div className="pp:p-4">
          <div className="pp:space-y-3">
            <div className="pp:relative">
              <Search className="pp:pointer-events-none pp:absolute pp:top-1/2 pp:left-3 pp:size-3.5 pp:-translate-y-1/2 pp:text-muted-foreground" />
              <input
                aria-label="Search actions"
                className="pp:w-full pp:rounded-md pp:border pp:border-input pp:bg-background pp:py-2 pp:pr-3 pp:pl-8 pp:text-sm pp:outline-none pp:focus-visible:border-ring pp:focus-visible:ring-2 pp:focus-visible:ring-ring/40"
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search actions"
                type="search"
                value={searchValue}
              />
            </div>

            <CategoryFilterBar
              activeCategory={activeCategory}
              categories={toolbarCategories}
              onCategoryChange={setActiveCategory}
            />

            {activeCategory === "custom-prompt" ? (
              <CustomPromptList
                isLoading={isLoading}
                onRun={(prompt) => onRunCustomPrompt(prompt.prompt)}
                prompts={searchableCustomPrompts}
              />
            ) : (
              <ActionGroupList
                activeActionId={activeActionId}
                groupedActions={groupedActions}
                isLoading={isLoading}
                onAction={onAction}
                onKeyDown={handleKeyDown}
              />
            )}
          </div>
        </div>
      </div>
    </FloatingDelayGroup>
  );
}
