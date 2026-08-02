import {
  ClipboardCopy,
  CopyCheck,
  Loader2,
  RefreshCw,
  Replace,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResultActionsProps } from "@/types";

export function ResultActions({
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
      <div className="pp:flex pp:gap-3 pp:border-border pp:border-t pp:pt-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button disabled={!hasCopyableText || isRunning} onClick={onCopy}>
                {copied ? (
                  <CopyCheck className="pp:h-4 pp:w-4" color="green" />
                ) : (
                  <ClipboardCopy className="pp:h-4 pp:w-4" />
                )}
              </Button>
            }
          />
          <TooltipContent side="top">
            <span>Copy</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button disabled={!canReplace} onClick={onReplace}>
                <Replace className="pp:mr-2 pp:inline-block pp:h-4 pp:w-4" />
              </Button>
            }
          />
          <TooltipContent side="top">
            <span>Replace</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button disabled={!canRerun} onClick={onRerun}>
                {isRunning ? (
                  <Loader2 className="pp:h-4 pp:w-4 pp:animate-spin" />
                ) : (
                  <RefreshCw className="pp:h-4 pp:w-4" />
                )}
              </Button>
            }
          />
          <TooltipContent side="top">
            <span>Re-run</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={onClose}>
                <X className="pp:h-4 pp:w-4" />
              </Button>
            }
          />
          <TooltipContent side="top">
            <span>Close</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
