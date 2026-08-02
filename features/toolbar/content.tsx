import { useFloatingPortalNode } from "@floating-ui/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { getProviderDefinition } from "@/features/providers/registry";
import { setDefaultProvider } from "@/features/providers/storage";
import { useActionHandlers } from "./action-handlers";
import {
  useProviderState,
  useSelectionHandler,
  useThemeWatcher,
} from "./hooks";
import { ToolbarPopover } from "./popover";
import { INITIAL_TOOLBAR_STATE, toolbarReducer } from "./reducer";
import { ResultDialog } from "./result-dialog";

export function ContextualToolbarContent() {
  const [state, dispatch] = useReducer(toolbarReducer, INITIAL_TOOLBAR_STATE);
  const themeVersion = useThemeWatcher();
  const {
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    configuredProviders,
    configuredProviderModels,
  } = useProviderState();
  const { selectionRangeRef } = useSelectionHandler(dispatch);
  const stateRef = useRef(state);
  const providerRef = useRef(selectedProvider);
  const modelRef = useRef(selectedModel);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const [portalRoot, setPortalRoot] = useState<ShadowRoot | HTMLElement | null>(
    null
  );

  const portalNode = useFloatingPortalNode({
    id: "promptpen-contextual-toolbar-portal",
    root: portalRoot,
  });

  useEffect(() => {
    const rootNode = hostRef.current?.getRootNode();
    if (rootNode instanceof ShadowRoot) {
      setPortalRoot(rootNode.getElementById("pp:root") ?? rootNode);
    }
  }, []);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    providerRef.current = selectedProvider;
  }, [selectedProvider]);

  useEffect(() => {
    modelRef.current = selectedModel;
  }, [selectedModel]);

  const { handleAction, handleCopy, handleRerun, handleReplace, handleClose } =
    useActionHandlers(
      stateRef,
      providerRef,
      modelRef,
      dispatch,
      selectionRangeRef
    );

  const {
    selectedText,
    toolbarPos,
    showResult,
    processedText,
    isRunning,
    activeActionId,
    lastActionId,
    errorText,
    copied,
  } = state;

  return (
    <div key={themeVersion} ref={hostRef}>
      {!showResult && (
        <ToolbarPopover
          activeActionId={activeActionId}
          configuredProviderModels={configuredProviderModels}
          configuredProviders={configuredProviders}
          isRunning={isRunning}
          onAction={(actionId) => {
            void handleAction(actionId);
          }}
          onModelChange={(model) => {
            setSelectedModel(model);
          }}
          onProviderChange={(provider) => {
            setSelectedProvider(provider);
            setSelectedModel(
              configuredProviderModels[provider] ||
                getProviderDefinition(provider).defaultModel
            );
            setDefaultProvider(provider);
          }}
          onRunCustomPrompt={(prompt) => {
            void handleAction("custom-prompt", prompt);
          }}
          portalNode={portalNode}
          selectedModel={selectedModel}
          selectedProvider={selectedProvider}
          toolbarPos={toolbarPos}
          visible={toolbarPos.visible}
        />
      )}

      <ResultDialog
        activeActionId={activeActionId}
        copied={copied}
        errorText={errorText}
        isRunning={isRunning}
        lastActionId={lastActionId}
        onClose={handleClose}
        onCopy={() => {
          void handleCopy();
        }}
        onReplace={handleReplace}
        onRerun={handleRerun}
        processedText={processedText}
        selectedText={selectedText}
        show={showResult}
      />
    </div>
  );
}
