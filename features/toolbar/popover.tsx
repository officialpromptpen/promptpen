import { AnimatePresence, m } from "framer-motion";
import { useRef } from "react";
import { createPortal } from "react-dom";
import Draggable from "react-draggable";
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
  const isDraggingRef = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  if (!portalNode) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible && (
        <Draggable
          handle=".pp-drag-handle"
          nodeRef={nodeRef}
          onDrag={() => {
            isDraggingRef.current = true;
          }}
          onStart={() => {
            isDraggingRef.current = false;
          }}
        >
          <div
            ref={nodeRef}
            className="pp:fixed pp:z-2147483647"
            style={{
              left: toolbarPos.x,
              position: "fixed",
              top: toolbarPos.y,
              transform: "translate(-50%, 0)",
            }}
          >
            <m.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <ToolbarActions
                activeActionId={activeActionId}
                configuredProviderModels={configuredProviderModels}
                configuredProviders={configuredProviders}
                isDraggingRef={isDraggingRef}
                isLoading={isRunning}
                onAction={onAction}
                onModelChange={onModelChange}
                onProviderChange={onProviderChange}
                onRunCustomPrompt={onRunCustomPrompt}
                selectedModel={selectedModel}
                selectedProvider={selectedProvider}
              />
            </m.div>
          </div>
        </Draggable>
      )}
    </AnimatePresence>,
    portalNode
  );
}
