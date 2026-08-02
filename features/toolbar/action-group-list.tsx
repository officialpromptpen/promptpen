import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ACTION_CATEGORY_LABELS } from "@/constants/actions";
import type { ActionGroupListProps } from "@/types";

export function ActionGroupList({
  groupedActions,
  isLoading,
  activeActionId,
  onAction,
  onKeyDown,
}: ActionGroupListProps) {
  if (groupedActions.length === 0) {
    return (
      <p className="pp:rounded-md pp:bg-muted/60 pp:p-3 pp:text-muted-foreground pp:text-sm">
        No actions matched your search.
      </p>
    );
  }

  return (
    <ScrollArea className="pp:max-h-[52vh]">
      <div className="pp:space-y-4 pp:pr-1">
        {groupedActions.map((group) => (
          <div className="pp:space-y-1.5" key={group.category}>
            <h3 className="pp:mt-2 pp:px-1 pp:font-semibold pp:text-muted-foreground pp:text-xs pp:uppercase pp:tracking-wide">
              {ACTION_CATEGORY_LABELS[group.category]}
            </h3>

            {group.items.map((action) => {
              const Icon = action.icon;
              const isCurrent = isLoading && activeActionId === action.id;

              return (
                <Button
                  aria-label={action.label}
                  className="pp:w-full pp:justify-start pp:gap-2 pp:rounded-md pp:px-2"
                  disabled={isLoading}
                  key={action.id}
                  onClick={() => onAction(action.id)}
                  onKeyDown={(event) => onKeyDown(event, action.id)}
                  size="default"
                  tabIndex={0}
                  variant="ghost"
                >
                  {isCurrent ? (
                    <Loader2 className="pp:size-3.5 pp:shrink-0 pp:animate-spin" />
                  ) : (
                    <Icon className="pp:size-3.5 pp:shrink-0" />
                  )}
                  <span className="pp:flex-1 pp:text-left">{action.label}</span>
                </Button>
              );
            })}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
