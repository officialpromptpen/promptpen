import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResultDialogProps } from "@/types";
import { ResultActions } from "./result-actions";
import { ResultBody } from "./result-body";

export function ResultDialog({
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
      {Boolean(show) && (
        <m.div
          animate={{ opacity: 1 }}
          className="pp:fixed pp:inset-0 pp:z-2147483647 pp:flex pp:items-center pp:justify-center pp:bg-black/20 pp:p-4 pp:backdrop-blur-xs"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <m.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="pp:flex pp:max-h-[85vh] pp:w-full pp:max-w-xl pp:flex-col pp:overflow-hidden pp:rounded-xl pp:border pp:border-border/70 pp:bg-card pp:text-card-foreground pp:shadow-2xl"
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {/* Header with Close icon button and tooltip on top right */}
            <div className="pp:flex pp:shrink-0 pp:items-center pp:justify-between pp:border-border/70 pp:border-b pp:px-4 pp:py-3">
              <div className="pp:flex pp:items-center pp:gap-2">
                <div className="pp:flex pp:size-6 pp:items-center pp:justify-center pp:rounded-md">
                  <Logo />
                </div>
                <h2 className="pp:font-semibold pp:text-muted-foreground pp:text-xs pp:uppercase pp:tracking-wider">
                  Processed Text
                </h2>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Close dialog"
                        onClick={onClose}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <X className="pp:size-4" />
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom">
                    <span>Close tab</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Scrollable Content Body with Shadcn ScrollArea */}
            <ScrollArea className="pp:min-h-0 pp:w-full pp:flex-1">
              <div className="pp:p-4">
                <ResultBody
                  activeActionId={activeActionId}
                  errorText={errorText}
                  isRunning={isRunning}
                  processedText={processedText}
                />
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>

            {/* Fixed Footer for Action Buttons */}
            <div className="pp:shrink-0 pp:border-border/70 pp:border-t pp:bg-card pp:p-4">
              <ResultActions
                copied={copied}
                errorText={errorText}
                isRunning={isRunning}
                lastActionId={lastActionId}
                onClose={onClose}
                onCopy={onCopy}
                onReplace={onReplace}
                onRerun={onRerun}
                processedText={processedText}
                selectedText={selectedText}
              />
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
