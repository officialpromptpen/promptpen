import { AnimatePresence, m } from "framer-motion";
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
      {show && (
        <m.div
          animate={{ opacity: 1 }}
          className="pp:fixed pp:inset-0 pp:z-2147483647 pp:flex pp:items-center pp:justify-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <m.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="pp:mx-4 pp:w-full pp:max-w-md pp:space-y-4 pp:rounded-lg pp:border pp:bg-card pp:p-6 pp:text-card-foreground pp:shadow-2xl"
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <ResultBody
              activeActionId={activeActionId}
              errorText={errorText}
              isRunning={isRunning}
              processedText={processedText}
            />

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
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
