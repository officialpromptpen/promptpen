import { storage } from "@wxt-dev/storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProviderDefinition } from "@/features/providers/registry";
import {
  getConfiguredProviderDetails,
  getProviderSummary,
  STORAGE_KEY,
} from "@/features/providers/storage";
import { getThemeChangeTarget } from "@/features/storage/theme-sync";
import type { AIProvider, ToolbarAction } from "@/types";

export function useThemeWatcher() {
  const [themeVersion, setThemeVersion] = useState(0);
  useEffect(() => {
    const target = getThemeChangeTarget();
    function handleChange() {
      setThemeVersion((current) => current + 1);
    }
    target.addEventListener("change", handleChange);
    return () => target.removeEventListener("change", handleChange);
  }, []);
  return themeVersion;
}

export function useProviderState() {
  const [selectedProvider, setSelectedProvider] =
    useState<AIProvider>("openai");
  const [selectedModel, setSelectedModel] = useState(
    () => getProviderDefinition("openai").defaultModel
  );
  const [configuredProviders, setConfiguredProviders] = useState<AIProvider[]>(
    []
  );
  const [configuredProviderModels, setConfiguredProviderModels] = useState<
    Partial<Record<AIProvider, string>>
  >({});

  const hydrateProviderChoice = useCallback(async () => {
    try {
      const [summary, configuredDetails] = await Promise.all([
        getProviderSummary(),
        getConfiguredProviderDetails(),
      ]);

      const availableProviders = configuredDetails.map(
        (detail) => detail.provider
      );
      const availableProviderModels = configuredDetails.reduce<
        Partial<Record<AIProvider, string>>
      >((accumulator, detail) => {
        accumulator[detail.provider] = detail.model;
        return accumulator;
      }, {});

      setConfiguredProviders(availableProviders);
      setConfiguredProviderModels(availableProviderModels);

      if (availableProviders.length === 0) {
        setSelectedProvider(summary.defaultProvider);
        setSelectedModel(
          summary.defaultModel ||
            getProviderDefinition(summary.defaultProvider).defaultModel
        );
        return;
      }

      const resolvedProvider =
        availableProviders.length === 1
          ? availableProviders[0]
          : availableProviders.includes(summary.defaultProvider)
            ? summary.defaultProvider
            : availableProviders[0];
      const resolvedModel =
        availableProviderModels[resolvedProvider] ||
        getProviderDefinition(resolvedProvider).defaultModel;

      setSelectedProvider(resolvedProvider);
      setSelectedModel(resolvedModel);
    } catch {
      // Use defaults if provider summary is not available.
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      if (!mounted) {
        return;
      }
      await hydrateProviderChoice();
    }

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [hydrateProviderChoice]);

  // storage.watch returns `Unwatch` (() => void); returning it directly cleans
  // up the subscription on unmount. react-doctor only recognizes cleanup-returning
  // APIs named subscribe/sub/listen, so it cannot verify .watch()'s handle.
  // oxlint-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(
    () =>
      storage.watch(`local:${STORAGE_KEY}`, async () => {
        await hydrateProviderChoice();
      }),
    [hydrateProviderChoice]
  );

  return {
    configuredProviderModels,
    configuredProviders,
    selectedModel,
    selectedProvider,
    setSelectedModel,
    setSelectedProvider,
  };
}

export function useSelectionHandler(dispatch: (action: ToolbarAction) => void) {
  const selectionRangeRef = useRef<Range | null>(null);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      return;
    }

    const range = selection.getRangeAt(0).cloneRange();
    selectionRangeRef.current = range;

    const rect = range.getBoundingClientRect();
    const anchorX = rect.left + rect.width / 2;
    const anchorY = rect.bottom + 12;

    dispatch({
      position: { visible: true, x: anchorX, y: anchorY },
      text,
      type: "SELECTION_CHANGED",
    });
  }, [dispatch]);

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection, true);
    document.addEventListener("keyup", handleSelection, true);
    document.addEventListener("selectionchange", handleSelection, true);

    return () => {
      document.removeEventListener("mouseup", handleSelection, true);
      document.removeEventListener("keyup", handleSelection, true);
      document.removeEventListener("selectionchange", handleSelection, true);
    };
  }, [handleSelection]);

  return { handleSelection, selectionRangeRef };
}
