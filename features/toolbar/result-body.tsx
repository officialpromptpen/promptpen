import { Loader2, TriangleAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
    <div className="pp:p-1">
      <h2 className="pp:mb-2 pp:font-semibold pp:text-muted-foreground pp:text-sm pp:uppercase">
        Processed Text
      </h2>

      <Separator />

      {isRunning && (
        <div className="pp:flex pp:items-center pp:gap-2 pp:rounded-md pp:bg-muted pp:p-3 pp:text-muted-foreground pp:text-sm">
          <Loader2 className="pp:h-4 pp:w-4 pp:animate-spin" />
          <span>
            {activeActionId ? `Processing ${actionLabel}...` : "Processing..."}
          </span>
        </div>
      )}

      {!isRunning && errorText && (
        <div className="pp:flex pp:items-start pp:gap-2 pp:rounded-md pp:border pp:border-destructive/40 pp:bg-destructive/10 pp:p-3 pp:text-destructive pp:text-sm">
          <TriangleAlert className="pp:mt-0.5 pp:h-4 pp:w-4 pp:shrink-0" />
          <span className="pp:wrap-break-word pp:whitespace-pre-wrap">
            {errorText}
          </span>
        </div>
      )}

      {!(isRunning || errorText) && processedText && (
        <p className="pp:text-balance pp:rounded-md pp:p-3 pp:font-medium pp:text-base">
          {processedText}
        </p>
      )}
    </div>
  );
}
