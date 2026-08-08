import { Loader2, TriangleAlert } from "lucide-react";
import type { ResultBodyProps } from "@/types";
import { getActionLabel } from "./utils";

export function ResultBody({
  isRunning,
  activeActionId,
  errorText,
  processedText,
}: ResultBodyProps) {
  const actionLabel = getActionLabel(activeActionId);

  return (
    <div className="pp:space-y-3">
      {Boolean(isRunning) && (
        <div className="pp:flex pp:items-center pp:gap-2 pp:rounded-md pp:bg-muted pp:p-3 pp:text-muted-foreground pp:text-sm">
          <Loader2 className="pp:h-4 pp:w-4 pp:animate-spin" />
          <span>
            {activeActionId ? `Processing ${actionLabel}...` : "Processing..."}
          </span>
        </div>
      )}

      {Boolean(!isRunning && errorText) && (
        <div className="pp:flex pp:items-start pp:gap-2 pp:rounded-md pp:border pp:border-destructive/40 pp:bg-destructive/10 pp:p-3 pp:text-destructive pp:text-sm">
          <TriangleAlert className="pp:mt-0.5 pp:h-4 pp:w-4 pp:shrink-0" />
          <span className="pp:whitespace-pre-wrap pp:break-words">
            {errorText}
          </span>
        </div>
      )}

      {Boolean(!isRunning && !errorText && processedText) && (
        <div className="pp:whitespace-pre-wrap pp:break-words pp:rounded-md pp:text-base pp:leading-relaxed">
          {processedText}
        </div>
      )}
    </div>
  );
}
