// ──────────────────────────── Core Domain Types ────────────────────────────
export type {
  Action,
  ActionCategory,
  AIProvider,
  ProviderCategory,
  Theme,
  WebsiteRule,
} from "./core";
// ──────────────────────────── Options Page Types ────────────────────────────
export type {
  AddFormProps,
  OptionsSettings,
  OptionsState,
  Section,
  SectionId,
  WebsiteAccessStateParam,
  WebsiteListSectionProps,
} from "./options";

// ──────────────────────────── Provider Types ────────────────────────────
export type {
  ConfiguredProviderDetail,
  ConnectionStatus,
  ProviderAdapter,
  ProviderDefinition,
  ProviderEditorState,
  ProviderIconProps,
  ProviderRuntimeConfig,
  ProviderSummary,
  ProviderTestResult,
} from "./provider";

// ──────────────────────────── Storage Types ────────────────────────────
export type {
  CustomPromptDefinition,
  WebsiteAccessState,
} from "./storage";
// ──────────────────────────── Toolbar Types ────────────────────────────
export type {
  ActionGroupListProps,
  CategoryFilterBarProps,
  ClosedToolbarStateProps,
  CustomPromptListProps,
  ResultActionsProps,
  ResultBodyProps,
  ResultDialogProps,
  ToolbarAction,
  ToolbarActionsProps,
  ToolbarCategory,
  ToolbarPopoverProps,
  ToolbarPosition,
  ToolbarState,
} from "./toolbar";

// ──────────────────────────── UI Types ────────────────────────────
export type {
  ActiveTabState,
  LayoutProps,
  StatusCardProps,
  ToolbarStore,
} from "./ui";

// ──────────────────────────── Writing Action Types ────────────────────────────
export type { WritingAction, WritingOutput } from "./writing";
export { writingActionSchema, writingOutputSchema } from "./writing";
