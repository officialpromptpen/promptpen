import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowLeftRight,
  BookOpen,
  Languages,
  Loader2,
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  RefreshCw,
  SpellCheck,
  TrendingUp,
} from "lucide-react"
import { useCallback, useMemo } from "react"

interface Action {
  id: string
  label: string
  icon: typeof SpellCheck
}

const actions: Action[] = [
  { id: "grammar", label: "Grammar", icon: SpellCheck },
  { id: "rewrite", label: "Rewrite", icon: RefreshCw },
  { id: "improve", label: "Improve", icon: TrendingUp },
  { id: "shorten", label: "Shorten", icon: Minimize2 },
  { id: "expand", label: "Expand", icon: Maximize2 },
  { id: "explain", label: "Explain", icon: BookOpen },
  { id: "summarize", label: "Summarize", icon: Languages },
  { id: "translate", label: "Translate", icon: ArrowLeftRight },
  { id: "continue", label: "Continue", icon: MessageSquarePlus },
]

interface ToolbarActionsProps {
  onAction: (actionId: string) => void
  isLoading?: boolean
  activeActionId?: string | null
  enabledActionIds?: string[]
  defaultActionId?: string | null
}

export function ToolbarActions({
  onAction,
  isLoading = false,
  activeActionId = null,
  enabledActionIds,
  defaultActionId = null,
}: ToolbarActionsProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, actionId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onAction(actionId)
      }
    },
    [onAction],
  )

  const enabledSet = useMemo(() => enabledActionIds ? new Set(enabledActionIds) : null, [enabledActionIds])
  const visibleActions = enabledSet
    ? actions.filter((a) => enabledSet.has(a.id))
    : actions

  if (visibleActions.length === 0) return null

  return (
    <TooltipProvider delayDuration={120}>
      <fieldset className="m-0 flex items-center gap-0.5 border-0 p-0" aria-label="Writing actions">
        {visibleActions.map((action) => {
          const Icon = action.icon
          const isDefault = action.id === defaultActionId
          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  aria-label={action.label}
                  tabIndex={0}
                  onClick={() => onAction(action.id)}
                  onKeyDown={(e) => handleKeyDown(e, action.id)}
                  disabled={isLoading}
                  variant={isDefault ? "secondary" : "ghost"}
                  size="icon"
                >
                  {isLoading && activeActionId === action.id ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin" />
                  ) : (
                    <Icon className="size-3.5 shrink-0" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span>
                  {action.label}
                  {isDefault ? " (Default)" : ""}
                </span>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </fieldset>
    </TooltipProvider>
  )
}
