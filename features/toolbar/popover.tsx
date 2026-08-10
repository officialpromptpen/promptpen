import { AnimatePresence, m, useDragControls } from "framer-motion";
import { useRef } from "react";
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
  const isDraggingRef = useRef(false);
  const dragControls = useDragControls();

  if (!portalNode) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible && (
        <m.div
          animate={{ opacity: 1, scale: 1 }}
          className="pp:fixed pp:z-2147483647"
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          exit={{ opacity: 0, scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.9 }}
          onDrag={() => {
            isDraggingRef.current = true;
          }}
          onDragStart={() => {
            isDraggingRef.current = false;
          }}
          style={{
            left: toolbarPos.x,
            position: "fixed",
            top: toolbarPos.y,
            transform: "translate(-50%, 0)",
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <div
            className="pp-drag-handle"
            onPointerDown={(e) => {
              dragControls.start(e);
            }}
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
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    portalNode
  );
}
