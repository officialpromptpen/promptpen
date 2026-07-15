import { Button } from "@/components/ui/button"
import { FloatingDelayGroup } from "@floating-ui/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useCallback, useMemo } from "react"
import { type ToolbarActionsProps } from "@/types"
import { actions } from "@/constants/actions"
import { Loader2 } from "lucide-react"

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
      <FloatingDelayGroup delay={200}>
      <TooltipProvider delay={120}>
          <div className="pp:m-0 pp:flex pp:items-center pp:gap-0.5 pp:border-0 pp:p-0" aria-label="Writing actions">
            {visibleActions.map((action) => {
              const Icon = action.icon
              return (
                <Tooltip key={action.id}>
                  <TooltipTrigger>
                    <Button
                      type="button"
                      aria-label={action.label}
                      tabIndex={0}
                      onClick={() => onAction(action.id)}
                      onKeyDown={(e) => handleKeyDown(e, action.id)}
                      disabled={isLoading}
                      variant={"ghost"}
                      size="icon"
                    >
                      {isLoading && activeActionId === action.id ? (
                        <Loader2 className="pp:size-3.5 pp:shrink-0 pp:animate-spin" />
                      ) : (
                        <Icon className="pp:size-3.5 pp:shrink-0" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4} align="center">
                      {action.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
      </TooltipProvider>
      </FloatingDelayGroup>
  )
}
