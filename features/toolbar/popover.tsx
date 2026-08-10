import { AnimatePresence, m } from "framer-motion";
import { useRef } from "react";
import Draggable from "react-draggable";
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
  const nodeRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  if (!portalNode) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible && (
        <m.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="pp:fixed pp:z-2147483647"
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
          <Draggable
            handle=".pp-drag-handle"
            nodeRef={nodeRef as React.RefObject<HTMLElement>}
            onDrag={() => {
              isDraggingRef.current = true;
            }}
            onStart={() => {
              isDraggingRef.current = false;
            }}
          >
            <div ref={nodeRef}>
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
            </div>
          </Draggable>
        </m.div>
      )}
    </AnimatePresence>,
    portalNode
  );
}
