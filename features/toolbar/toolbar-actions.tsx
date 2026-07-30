import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FloatingDelayGroup } from "@floating-ui/react";
import {
	Loader2,
	Search,
	WandSparkles,
	X,
} from "lucide-react";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { AIProviderSelectIcon } from "@/components/ai-provider-select-icon";
import type { AIProviderOption } from "@/components/ai-provider-constants";
import {
	ACTION_CATEGORY_LABELS,
	ACTION_CATEGORY_ORDER,
	actions,
} from "@/constants/actions";
import {
	getProviderDefinition,
	PROVIDER_DEFINITIONS,
	CATEGORY_LABELS,
} from "@/features/providers/registry";
import { setDefaultProvider } from "@/features/providers/storage";
import {
	getCustomPrompts,
} from "@/features/storage/custom-prompts";
import type {
	AIProvider,
	CustomPromptDefinition,
	ProviderCategory,
	ToolbarActionsProps,
	ToolbarCategory,
	CategoryFilterBarProps,
	ActionGroupListProps,
	ClosedToolbarStateProps,
	CustomPromptListProps,
} from "@/types";
import { Logo } from "@/components/Logo";

const TOOLBAR_CATEGORIES = [
	{ id: "all" as const, label: "All" },
	...ACTION_CATEGORY_ORDER.map((category) => ({
		id: category,
		label: ACTION_CATEGORY_LABELS[category],
	})),
	{ id: "custom-prompt" as const, label: "Custom Prompt" },
];

function CategoryFilterBar({
	categories,
	activeCategory,
	onCategoryChange,
}: CategoryFilterBarProps) {
	return (
		<ScrollArea className="pp:max-w-full">
			<div className="pp:flex pp:gap-2 pp:flex-nowrap">
				{categories.map((category) => (
					<Button
						key={category.id}
						variant={
							activeCategory === category.id ? "secondary" : "ghost"
						}
						size="sm"
						onClick={() => onCategoryChange(category.id)}
						title={`Filter by ${category.label} actions`}
					>
						{category.label}
					</Button>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
}

function ActionGroupList({
	groupedActions,
	isLoading,
	activeActionId,
	onAction,
	onKeyDown,
}: ActionGroupListProps) {
	if (groupedActions.length === 0) {
		return (
			<p className="pp:rounded-md pp:bg-muted/60 pp:p-3 pp:text-sm pp:text-muted-foreground">
				No actions matched your search.
			</p>
		);
	}

	return (
		<ScrollArea className="pp:max-h-[52vh]">
			<div className="pp:space-y-4 pp:pr-1">
				{groupedActions.map((group) => (
					<div key={group.category} className="pp:space-y-1.5">
						<h3 className="pp:px-1 pp:mt-2 pp:text-xs pp:font-semibold pp:tracking-wide pp:text-muted-foreground pp:uppercase">
							{ACTION_CATEGORY_LABELS[group.category]}
						</h3>

						{group.items.map((action) => {
							const Icon = action.icon;
							const isCurrent =
								isLoading && activeActionId === action.id;

							return (
								<Button
									key={action.id}
									aria-label={action.label}
									tabIndex={0}
									onClick={() => onAction(action.id)}
									onKeyDown={(event) =>
										onKeyDown(event, action.id)
									}
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
									<span className="pp:flex-1 pp:text-left">
										{action.label}
									</span>
								</Button>
							);
						})}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}

function ClosedToolbarState({ onOpen }: ClosedToolbarStateProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							aria-label="Open PromptPen actions"
							onClick={onOpen}
							size="icon"
							className="pp:rounded-none pp:bg-primary pp:text-primary-foreground pp:hover:bg-primary/95 pp:focus-visible:ring-2 pp:focus-visible:ring-ring/40"

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
	);
}

function CustomPromptList({
	prompts,
	isLoading,
	onRun,
}: CustomPromptListProps) {
	if (prompts.length === 0) {
		return (
			<div className="pp:rounded-md pp:border pp:border-dashed pp:bg-background/70 pp:p-4 pp:text-sm pp:text-muted-foreground">
				No custom prompts saved yet. Add them from Dashboard &gt;
				Custom Prompts.
			</div>
		);
	}

	return (
		<ScrollArea className="pp:max-h-[52vh]">
			<div className="pp:space-y-3 pp:pr-1">
				{prompts.map((item) => (
					<Button
						key={item.id}
						variant="ghost"
						size="default"
						className="pp:w-full pp:justify-start pp:gap-2 pp:rounded-md pp:px-2"
						disabled={isLoading}
						onClick={() => onRun(item)}
					>
						<WandSparkles className="pp:size-3.5 pp:shrink-0" />
						<span className="pp:flex-1 pp:text-left">
							{item.title}
						</span>
					</Button>
				))}
			</div>
		</ScrollArea>
	);
}

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
		[],
	);

	const handleKeyDown = useCallback(
		(event: ReactKeyboardEvent, actionId: string) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				onAction(actionId);
			}
		},
		[onAction],
	);

	const enabledSet = useMemo(
		() => (enabledActionIds ? new Set(enabledActionIds) : null),
		[enabledActionIds],
	);

	const providerOptions = useMemo(
		() =>
			(configuredProviders ?? []).map((id) => {
				const def = getProviderDefinition(id);
				return {
					id,
					name: def.label,
					group:
						CATEGORY_LABELS[
							def.category ?? ("openai-compatible" as ProviderCategory)
						],
				};
			}),
		[configuredProviders],
	);

	useEffect(() => {
		let mounted = true;
		async function hydrateCustomPrompts() {
			const prompts = await getCustomPrompts();
			if (!mounted) return;
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
				(action) => action.category === category,
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

		return customPrompts.filter((item) => {
			return (
				item.title.toLowerCase().includes(normalizedQuery) ||
				item.prompt.toLowerCase().includes(normalizedQuery)
			);
		});
	}, [customPrompts, searchValue]);

	const toolbarCategories = TOOLBAR_CATEGORIES;

	if (actions.length === 0) return null;

	if (!isPanelOpen) {
		return <ClosedToolbarState onOpen={() => setIsPanelOpen(true)} />;
	}

	return (
		<FloatingDelayGroup delay={150}>
			<div
				className="pp:w-[min(64vw,564px)] pp:max-h-[80vh] pp:overflow-hidden pp:rounded-xl pp:border pp:border-border/70 pp:bg-popover pp:text-popover-foreground pp:shadow-2xl"
				aria-label="PromptPen action panel"
			>
				<div className="pp:flex  pp:flex-row pp:px-2.5 pp:justify-between pp:items-center pp:gap-3 pp:border-b pp:border-border pp:py-3">

					<div className="pp:flex pp:items-center pp:gap-2">
						<div className="pp:flex pp:size-7 pp:items-center pp:justify-center pp:rounded-lg">
							<Logo />
						</div>
						<span className="pp:text-sm pp:font-semibold">PromptPen Actions</span>
					</div>

					<div className="pp:ml-auto pp:flex pp:items-center pp:gap-2">
						<AIProviderSelectIcon
							value={selectedProvider}
							providers={providerOptions}
							onValueChange={(provider) => {
								if (!provider) return;
								setDefaultProvider(provider as AIProvider);
								onProviderChange(provider as AIProvider);
							}}
							disabled={isLoading}
						/>

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

						<CategoryFilterBar
							categories={toolbarCategories}
							activeCategory={activeCategory}
							onCategoryChange={setActiveCategory}
						/>

						{activeCategory !== "custom-prompt" ? (
							<ActionGroupList
								groupedActions={groupedActions}
								isLoading={isLoading}
								activeActionId={activeActionId}
								onAction={onAction}
								onKeyDown={handleKeyDown}
							/>
						) : (
							<CustomPromptList
								prompts={searchableCustomPrompts}
								isLoading={isLoading}
								onRun={(prompt) => onRunCustomPrompt(prompt.prompt)}
							/>
						)}
					</div>
				</div>
			</div>
		</FloatingDelayGroup>
	);
}
