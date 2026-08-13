import { AnimatePresence, m } from "framer-motion";
import { GripVertical, WandSparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClosedToolbarStateProps } from "@/types";

export function ClosedToolbarState({
  onOpen,
  isDraggingRef,
  onPointerDownDrag,
}: ClosedToolbarStateProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <div
              className="pp-drag-handle pp:flex pp:cursor-grab pp:select-none pp:items-center pp:rounded-lg pp:border pp:border-border/70 pp:bg-primary pp:p-1 pp:text-primary-foreground pp:shadow-xl active:pp:cursor-grabbing"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onPointerDown={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest("button")) {
                  onPointerDownDrag?.(e);
                }
              }}
            >
              <AnimatePresence initial={false}>
                {isHovered && (
                  <m.div
                    animate={{ opacity: 1, width: "auto" }}
                    className="pp:flex pp:items-center pp:overflow-hidden pp:pr-1 pp:pl-1"
                    exit={{ opacity: 0, width: 0 }}
                    initial={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <GripVertical className="pp:size-3.5 pp:opacity-75" />
                  </m.div>
                )}
              </AnimatePresence>

              <Button
                aria-label="Open PromptPen actions"
                className="pp:size-7 pp:p-0 pp:text-primary-foreground pp:hover:bg-primary-foreground/15"
                onClick={(e) => {
                  if (isDraggingRef?.current) {
                    e.stopPropagation();
                    return;
                  }
                  onOpen();
                }}
                size="icon"
                variant="ghost"
              >
                <WandSparkles className="pp:size-4" />
              </Button>
            </div>
          }
        />
        <TooltipContent align="center" side="bottom">
          Open actions
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
