import {
  ClipboardCopy,
  CopyCheck,
  Loader2,
  RefreshCw,
  Replace,
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
}: ResultActionsProps) {
  const hasCopyableText = Boolean(processedText || errorText);
  const canReplace = Boolean(processedText) && !isRunning && !errorText;
  const canRerun = Boolean(lastActionId) && !isRunning && Boolean(selectedText);

  return (
    <TooltipProvider>
      <div className="pp:flex pp:items-center pp:gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                disabled={!canReplace}
                onClick={onReplace}
                size="sm"
                variant="default"
              >
                <Replace className="pp:mr-1.5 pp:size-4" />
                Replace
              </Button>
            }
          />
          <TooltipContent side="top">
            <span>Replace selected text</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                disabled={!hasCopyableText || isRunning}
                onClick={onCopy}
                size="sm"
                variant="outline"
              >
                {copied ? (
                  <CopyCheck className="pp:mr-1.5 pp:size-4 pp:text-emerald-500" />
                ) : (
                  <ClipboardCopy className="pp:mr-1.5 pp:size-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            }
          />
          <TooltipContent side="top">
            <span>Copy text to clipboard</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                disabled={!canRerun}
                onClick={onRerun}
                size="sm"
                variant="outline"
              >
                {isRunning ? (
                  <Loader2 className="pp:mr-1.5 pp:size-4 pp:animate-spin" />
                ) : (
                  <RefreshCw className="pp:mr-1.5 pp:size-4" />
                )}
                Re-run
              </Button>
            }
          />
          <TooltipContent side="top">
            <span>Re-run last action</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
