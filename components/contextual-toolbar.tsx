import { useFloatingPortalNode } from "@floating-ui/react";
import { getThemeChangeTarget } from "@/features/storage/bridge";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import {
	ClipboardCopy,
	CopyCheck,
	Loader2,
	RefreshCw,
	Replace,
	TriangleAlert,
	X,
} from "lucide-react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getActionById } from "@/constants/actions";
import { getProviderDefinition } from "@/features/providers/catalog";
import { createProviderAdapter } from "@/features/providers/sdk";
import {
	getConfiguredProviderDetails,
	getProviderSummary,
} from "@/features/providers/storage";
import { ToolbarActions } from "@/features/toolbar/toolbar-actions";
import type {
	AIProvider,
	ResultActionsProps,
	ResultBodyProps,
	ResultDialogProps,
	ToolbarAction,
	ToolbarPopoverProps,
	ToolbarState,
} from "@/types";
import { Button } from "./ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { Separator } from "./ui/separator";

const INITIAL_TOOLBAR_STATE: ToolbarState = {
	selectedText: "",
	toolbarPos: { x: 0, y: 0, visible: false },
	showResult: false,
	processedText: "",
	isRunning: false,
	activeActionId: null,
	lastActionId: null,
	errorText: "",
	copied: false,
};

function toolbarReducer(
	state: ToolbarState,
	action: ToolbarAction,
): ToolbarState {
	switch (action.type) {
		case "SELECTION_CHANGED":
			if (state.showResult) return state;
			return {
				...state,
				selectedText: action.text,
				toolbarPos: action.position,
			};
		case "HIDE_TOOLBAR_IF_VISIBLE":
			if (state.showResult) return state;
			return { ...state, toolbarPos: { ...state.toolbarPos, visible: false } };
		case "RUN_ACTION":
			if (!state.selectedText.trim() || state.isRunning) return state;
			return {
				...state,
				showResult: true,
				toolbarPos: { ...state.toolbarPos, visible: false },
				isRunning: true,
				activeActionId: action.actionId,
				lastActionId: action.actionId,
				processedText: "",
				errorText: "",
				copied: false,
			};
		case "ACTION_SUCCESS":
			return {
				...state,
				isRunning: false,
				processedText: action.text,
				activeActionId: null,
			};
		case "ACTION_ERROR":
			return {
				...state,
				isRunning: false,
				errorText: action.error,
				activeActionId: null,
			};
		case "COPIED":
			return { ...state, copied: true };
		case "COPY_RESET":
			return { ...state, copied: false };
		case "RESET":
			return { ...INITIAL_TOOLBAR_STATE };
	}
}

function createActionPrompt(
	actionId: string,
	text: string,
	customPrompt?: string,
): string {
	if (actionId === "custom-prompt") {
		const instruction = customPrompt?.trim() || "Improve this text.";
		return `${instruction}\n\nText:\n"""\n${text}\n"""`;
	}

	const instruction = getActionById(actionId)?.prompt ?? "Improve this text.";
	return `${instruction}\n\nText:\n"""\n${text}\n"""`;
}

function getActionLabel(actionId: string | null): string {
	if (!actionId) {
		return "action";
	}

	if (actionId === "custom-prompt") {
		return "custom prompt";
	}

	return getActionById(actionId)?.label ?? actionId;
}

function getFriendlyActionError(error: unknown): string {
	const message = error instanceof Error ? error.message : "Unknown AI error";

	if (/extension context invalidated/i.test(message)) {
		return "Extension was reloaded or updated. Refresh this page, select text again, and retry.";
	}

	// Some provider setup failures can bubble up with unrelated text; normalize to a clear next step.
	if (
		/not configured|no provider|no api key|missing api key|provider.*(required|missing)|usefloating hook|contextual-toolbar\.tsx/i.test(
			message,
		)
	) {
		return "No AI provider configured. Go to Dashboard > AI Providers in Options and add a provider with API key.";
	}

	return `Request failed: ${message}`;
}

function ToolbarPopover({
	visible,
	portalNode,
	toolbarPos,
	isRunning,
	activeActionId,
	selectedProvider,
	selectedModel,
	onAction,
	onRunCustomPrompt,
	onProviderChange,
	onModelChange,
	configuredProviders,
	configuredProviderModels,
}: ToolbarPopoverProps) {
	if (!portalNode) {
		return null;
	}

	return createPortal(
		<AnimatePresence>
			{visible && (
				<m.div
					style={{
						position: "fixed",
						left: toolbarPos.x,
						top: toolbarPos.y,
						transform: "translate(-50%, 0)",
					}}
					className="pp:fixed pp:z-2147483647 pp:shadow-2xl"
					initial={{ opacity: 0, scale: 0.9, y: 4 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 4 }}
					transition={{ duration: 0.15, ease: "easeOut" }}
				>
					<ToolbarActions
						onAction={onAction}
						onRunCustomPrompt={onRunCustomPrompt}
						onProviderChange={onProviderChange}
						onModelChange={onModelChange}
						selectedProvider={selectedProvider}
						selectedModel={selectedModel}
						configuredProviders={configuredProviders}
						configuredProviderModels={configuredProviderModels}
						isLoading={isRunning}
						activeActionId={activeActionId}
					/>
				</m.div>
			)}
		</AnimatePresence>,
		portalNode,
	);
}

function ResultDialog({
	show,
	isRunning,
	activeActionId,
	processedText,
	errorText,
	copied,
	selectedText,
	lastActionId,
	onCopy,
	onReplace,
	onRerun,
	onClose,
}: ResultDialogProps) {
	return (
		<AnimatePresence>
			{show && (
				<m.div
					className="pp:fixed pp:inset-0 pp:z-2147483647 pp:flex pp:items-center pp:justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15, ease: "easeOut" }}
				>
					<m.div
						className="pp:mx-4 pp:w-full pp:max-w-md pp:space-y-4 pp:rounded-lg pp:border pp:bg-card pp:p-6 pp:text-card-foreground pp:shadow-2xl"
						initial={{ opacity: 0, scale: 0.95, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 8 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
					>
						<ResultBody
							isRunning={isRunning}
							activeActionId={activeActionId}
							errorText={errorText}
							processedText={processedText}
						/>

						<ResultActions
							copied={copied}
							isRunning={isRunning}
							processedText={processedText}
							errorText={errorText}
							selectedText={selectedText}
							lastActionId={lastActionId}
							onCopy={onCopy}
							onReplace={onReplace}
							onRerun={onRerun}
							onClose={onClose}
						/>
					</m.div>
				</m.div>
			)}
		</AnimatePresence>
	);
}

function ResultBody({
	isRunning,
	activeActionId,
	errorText,
	processedText,
}: ResultBodyProps) {
	const actionLabel = getActionLabel(activeActionId);

	return (
		<div className="pp:p-1">
			<h2 className="pp:text-sm pp:mb-2 pp:font-semibold pp:text-muted-foreground pp:uppercase">
				Processed Text
			</h2>
      
      <Separator/>

			{isRunning && (
				<div className="pp:flex pp:items-center pp:gap-2 pp:text-sm pp:text-muted-foreground pp:bg-muted pp:p-3 pp:rounded-md">
					<Loader2 className="pp:w-4 pp:h-4 pp:animate-spin" />
					<span>
						{activeActionId ? `Processing ${actionLabel}...` : "Processing..."}
					</span>
				</div>
			)}

			{!isRunning && errorText && (
				<div className="pp:flex pp:items-start pp:gap-2 pp:rounded-md pp:border pp:border-destructive/40 pp:bg-destructive/10 pp:p-3 pp:text-sm pp:text-destructive">
					<TriangleAlert className="pp:mt-0.5 pp:h-4 pp:w-4 pp:shrink-0" />
					<span className="pp:whitespace-pre-wrap pp:wrap-break-word">
						{errorText}
					</span>
				</div>
			)}

			{!isRunning && !errorText && processedText && (
				<p className="pp:text-base pp:p-3 pp:rounded-md pp:font-medium pp:text-balance">
					{processedText}
				</p>
			)}
		</div>
	);
}

function ResultActions({
	copied,
	isRunning,
	processedText,
	errorText,
	selectedText,
	lastActionId,
	onCopy,
	onReplace,
	onRerun,
	onClose,
}: ResultActionsProps) {
	const hasCopyableText = Boolean(processedText || errorText);
	const canReplace = Boolean(processedText) && !isRunning && !errorText;
	const canRerun = Boolean(lastActionId) && !isRunning && Boolean(selectedText);

	return (
		<TooltipProvider>
			<div className="pp:flex pp:gap-3 pp:pt-4 pp:border-t pp:border-border">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button onClick={onCopy} disabled={!hasCopyableText || isRunning}>
								{copied ? (
									<CopyCheck className="pp:w-4 pp:h-4" color="green" />
								) : (
									<ClipboardCopy className="pp:w-4 pp:h-4" />
								)}
							</Button>
						}
					></TooltipTrigger>
					<TooltipContent side="top">
						<span>Copy</span>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Button onClick={onReplace} disabled={!canReplace}>
								<Replace className="pp:w-4 pp:h-4 pp:inline-block pp:mr-2" />
							</Button>
						}
					></TooltipTrigger>
					<TooltipContent side="top">
						<span>Replace</span>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Button onClick={onRerun} disabled={!canRerun}>
								{isRunning ? (
									<Loader2 className="pp:w-4 pp:h-4 pp:animate-spin" />
								) : (
									<RefreshCw className="pp:w-4 pp:h-4" />
								)}
							</Button>
						}
					></TooltipTrigger>
					<TooltipContent side="top">
						<span>Re-run</span>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger
						render={
							<Button onClick={onClose}>
								<X className="pp:w-4 pp:h-4" />
							</Button>
						}
					></TooltipTrigger>
					<TooltipContent side="top">
						<span>Close</span>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}

function useThemeWatcher() {
	const [themeVersion, setThemeVersion] = useState(0);
	useEffect(() => {
		const target = getThemeChangeTarget();
		function handleChange() {
			setThemeVersion((current) => current + 1);
		}
		target.addEventListener("change", handleChange);
		return () => target.removeEventListener("change", handleChange);
	}, []);
	return themeVersion;
}

function useProviderState() {
	const [selectedProvider, setSelectedProvider] =
		useState<AIProvider>("openai");
	const [selectedModel, setSelectedModel] = useState(
		() => getProviderDefinition("openai").defaultModel,
	);
	const [configuredProviders, setConfiguredProviders] = useState<AIProvider[]>(
		[],
	);
	const [configuredProviderModels, setConfiguredProviderModels] = useState<
		Partial<Record<AIProvider, string>>
	>({});

	useEffect(() => {
		let mounted = true;

		async function hydrateProviderChoice() {
			try {
				const [summary, configuredDetails] = await Promise.all([
					getProviderSummary(),
					getConfiguredProviderDetails(),
				]);
				if (!mounted) return;

				const availableProviders = configuredDetails.map(
					(detail) => detail.provider,
				);
				const availableProviderModels = configuredDetails.reduce<
					Partial<Record<AIProvider, string>>
				>((accumulator, detail) => {
					accumulator[detail.provider] = detail.model;
					return accumulator;
				}, {});

				setConfiguredProviders(availableProviders);
				setConfiguredProviderModels(availableProviderModels);

				if (availableProviders.length === 0) {
					setSelectedProvider(summary.defaultProvider);
					setSelectedModel(
						summary.defaultModel ||
							getProviderDefinition(summary.defaultProvider).defaultModel,
					);
					return;
				}

				const resolvedProvider =
					availableProviders.length === 1
						? availableProviders[0]
						: availableProviders.includes(summary.defaultProvider)
							? summary.defaultProvider
							: availableProviders[0];
				const resolvedModel =
					availableProviderModels[resolvedProvider] ||
					getProviderDefinition(resolvedProvider).defaultModel;

				setSelectedProvider(resolvedProvider);
				setSelectedModel(resolvedModel);
			} catch {
				// Use defaults if provider summary is not available.
			}
		}

		void hydrateProviderChoice();
		return () => {
			mounted = false;
		};
	}, []);

	return {
		selectedProvider,
		setSelectedProvider,
		selectedModel,
		setSelectedModel,
		configuredProviders,
		configuredProviderModels,
	};
}

function useSelectionHandler(dispatch: (action: ToolbarAction) => void) {
	const selectionRangeRef = useRef<Range | null>(null);

	const handleSelection = useCallback(() => {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
			return;
		}

		const text = selection.toString().trim();
		if (!text) return;

		const range = selection.getRangeAt(0).cloneRange();
		selectionRangeRef.current = range;

		const rect = range.getBoundingClientRect();
		const anchorX = rect.left + rect.width / 2;
		const anchorY = rect.bottom + 12;

		dispatch({
			type: "SELECTION_CHANGED",
			text,
			position: { x: anchorX, y: anchorY, visible: true },
		});
	}, [dispatch]);

	useEffect(() => {
		document.addEventListener("mouseup", handleSelection, true);
		document.addEventListener("keyup", handleSelection, true);
		document.addEventListener("selectionchange", handleSelection, true);

		return () => {
			document.removeEventListener("mouseup", handleSelection, true);
			document.removeEventListener("keyup", handleSelection, true);
			document.removeEventListener("selectionchange", handleSelection, true);
		};
	}, [handleSelection]);

	return { selectionRangeRef, handleSelection };
}

function useActionHandlers(
	stateRef: React.MutableRefObject<ToolbarState>,
	providerRef: React.MutableRefObject<AIProvider>,
	modelRef: React.MutableRefObject<string>,
	dispatch: (action: ToolbarAction) => void,
	selectionRangeRef: React.MutableRefObject<Range | null>,
) {
	const handleAction = useCallback(
		async (actionId: string, customPrompt?: string) => {
			const current = stateRef.current;
			if (!current.selectedText.trim() || current.isRunning) return;

			dispatch({ type: "RUN_ACTION", actionId });

			try {
				const adapter = await createProviderAdapter(
					providerRef.current,
					modelRef.current,
				);
				if (!adapter) {
					dispatch({
						type: "ACTION_ERROR",
						error:
							"No AI provider configured. Go to Dashboard > AI Providers in Options and add a provider with API key.",
					});
					return;
				}

				const prompt = createActionPrompt(
					actionId,
					current.selectedText,
					customPrompt,
				);
				const response = await adapter.runPrompt(
					prompt,
					"You are a writing assistant. Return only the transformed output with no commentary.",
				);

				const normalized = response.trim();
				if (!normalized) {
					dispatch({
						type: "ACTION_ERROR",
						error:
							"The model returned an empty response. Try again with a different model.",
					});
					return;
				}

				dispatch({ type: "ACTION_SUCCESS", text: normalized });
			} catch (error) {
				dispatch({
					type: "ACTION_ERROR",
					error: getFriendlyActionError(error),
				});
			}
		},
		[stateRef, providerRef, modelRef, dispatch],
	);

	const handleCopy = useCallback(async () => {
		const current = stateRef.current;
		const textToCopy = current.processedText || current.errorText;
		if (!textToCopy) return;

		try {
			await navigator.clipboard.writeText(textToCopy);
			dispatch({ type: "COPIED" });
			window.setTimeout(() => dispatch({ type: "COPY_RESET" }), 1400);
		} catch {
			// Ignore clipboard failures.
		}
	}, [stateRef, dispatch]);

	const handleRerun = useCallback(() => {
		const current = stateRef.current;
		if (
			!current.lastActionId ||
			current.isRunning ||
			!current.selectedText.trim()
		) {
			return;
		}

		void handleAction(current.lastActionId);
	}, [stateRef, handleAction]);

	const handleReplace = useCallback(() => {
		const current = stateRef.current;
		if (!current.processedText || current.isRunning || current.errorText) {
			return;
		}

		const savedRange = selectionRangeRef.current;
		if (!savedRange) {
			dispatch({
				type: "ACTION_ERROR",
				error:
					"Could not replace text because the original selection was lost.",
			});
			return;
		}

		try {
			const range = savedRange.cloneRange();
			range.deleteContents();
			const replacementNode = document.createTextNode(current.processedText);
			range.insertNode(replacementNode);

			const selection = window.getSelection();
			if (selection) {
				const cursorRange = document.createRange();
				cursorRange.setStartAfter(replacementNode);
				cursorRange.collapse(true);
				selection.removeAllRanges();
				selection.addRange(cursorRange);
			}

			dispatch({ type: "RESET" });
			selectionRangeRef.current = null;
		} catch {
			dispatch({
				type: "ACTION_ERROR",
				error:
					"Failed to replace text in this area. Select text again and retry.",
			});
		}
	}, [stateRef, dispatch, selectionRangeRef]);

	const handleClose = useCallback(() => {
		dispatch({ type: "RESET" });
		selectionRangeRef.current = null;
		window.getSelection()?.removeAllRanges();
	}, [dispatch, selectionRangeRef]);

	return { handleAction, handleCopy, handleRerun, handleReplace, handleClose };
}

function ContextualToolbarContent() {
	const [state, dispatch] = useReducer(toolbarReducer, INITIAL_TOOLBAR_STATE);
	const themeVersion = useThemeWatcher();
	const {
		selectedProvider,
		setSelectedProvider,
		selectedModel,
		setSelectedModel,
		configuredProviders,
		configuredProviderModels,
	} = useProviderState();
	const { selectionRangeRef } = useSelectionHandler(dispatch);
	const stateRef = useRef(state);
	const providerRef = useRef(selectedProvider);
	const modelRef = useRef(selectedModel);
	const hostRef = useRef<HTMLDivElement | null>(null);

	const [portalRoot, setPortalRoot] = useState<ShadowRoot | HTMLElement | null>(
		null,
	);

	const portalNode = useFloatingPortalNode({
		id: "promptpen-contextual-toolbar-portal",
		root: portalRoot,
	});

	useEffect(() => {
		const rootNode = hostRef.current?.getRootNode();
		if (rootNode instanceof ShadowRoot) {
			setPortalRoot(rootNode.getElementById("pp:root") ?? rootNode);
		}
	}, []);

	useEffect(() => {
		stateRef.current = state;
	});

	useEffect(() => {
		providerRef.current = selectedProvider;
	}, [selectedProvider]);

	useEffect(() => {
		modelRef.current = selectedModel;
	}, [selectedModel]);

	const { handleAction, handleCopy, handleRerun, handleReplace, handleClose } =
		useActionHandlers(
			stateRef,
			providerRef,
			modelRef,
			dispatch,
			selectionRangeRef,
		);

	const {
		selectedText,
		toolbarPos,
		showResult,
		processedText,
		isRunning,
		activeActionId,
		lastActionId,
		errorText,
		copied,
	} = state;

	return (
		<div key={themeVersion} ref={hostRef}>
			{!showResult && (
				<ToolbarPopover
					visible={toolbarPos.visible}
					portalNode={portalNode}
					toolbarPos={toolbarPos}
					isRunning={isRunning}
					activeActionId={activeActionId}
					selectedProvider={selectedProvider}
					selectedModel={selectedModel}
					onAction={(actionId) => {
						void handleAction(actionId);
					}}
					onRunCustomPrompt={(prompt) => {
						void handleAction("custom-prompt", prompt);
					}}
					onProviderChange={(provider) => {
						setSelectedProvider(provider);
						setSelectedModel(
							configuredProviderModels[provider] ||
								getProviderDefinition(provider).defaultModel,
						);
					}}
					onModelChange={(model) => {
						setSelectedModel(model);
					}}
					configuredProviders={configuredProviders}
					configuredProviderModels={configuredProviderModels}
				/>
			)}

			<ResultDialog
				show={showResult}
				isRunning={isRunning}
				activeActionId={activeActionId}
				processedText={processedText}
				errorText={errorText}
				copied={copied}
				selectedText={selectedText}
				lastActionId={lastActionId}
				onCopy={() => {
					void handleCopy();
				}}
				onReplace={handleReplace}
				onRerun={handleRerun}
				onClose={handleClose}
			/>
		</div>
	);
}

export function ContextualToolbar() {
	return (
		<LazyMotion features={domAnimation}>
			<ContextualToolbarContent />
		</LazyMotion>
	);
}
