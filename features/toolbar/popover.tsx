import { AnimatePresence, m } from "framer-motion";
import { createPortal } from "react-dom";
import type { ToolbarPopoverProps } from "@/types";
import { ToolbarActions } from "./actions-panel";

export function ToolbarPopover({
  visible,
  portalNode,
  toolbarPos,
  isRunning,
  activeActionId,
  selectedProvider,
  selectedModel,
  onAction,
  onRunCustomPrompt,
  onProviderChange,
  onModelChange,
  configuredProviders,
  configuredProviderModels,
}: ToolbarPopoverProps) {
  if (!portalNode) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible && (
        <m.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="pp:fixed pp:z-2147483647 pp:shadow-2xl"
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          style={{
            left: toolbarPos.x,
            position: "fixed",
            top: toolbarPos.y,
            transform: "translate(-50%, 0)",
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <ToolbarActions
            activeActionId={activeActionId}
            configuredProviderModels={configuredProviderModels}
            configuredProviders={configuredProviders}
            isLoading={isRunning}
            onAction={onAction}
            onModelChange={onModelChange}
            onProviderChange={onProviderChange}
            onRunCustomPrompt={onRunCustomPrompt}
            selectedModel={selectedModel}
            selectedProvider={selectedProvider}
          />
        </m.div>
      )}
    </AnimatePresence>,
    portalNode
  );
}
