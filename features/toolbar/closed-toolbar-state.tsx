import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClosedToolbarStateProps } from "@/types";

export function ClosedToolbarState({ onOpen }: ClosedToolbarStateProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label="Open PromptPen actions"
              className="pp:rounded-none pp:bg-primary pp:text-primary-foreground pp:hover:bg-primary/95 pp:focus-visible:ring-2 pp:focus-visible:ring-ring/40"
              onClick={onOpen}
              size="icon"
            >
              <WandSparkles className="pp:size-4" />
            </Button>
          }
        />
        <TooltipContent align="center" side="bottom">
          Open actions
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
