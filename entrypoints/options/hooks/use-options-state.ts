import { storage } from "@wxt-dev/storage";
import { useEffect, useState } from "react";
import {
  defaultSettings,
  OPTIONS_PAGE_DESCRIPTION,
  OPTIONS_PAGE_TITLE,
  SETTINGS_KEY,
} from "@/constants/options";
import {
  getConfiguredProviderDetails,
  getProviderSummary,
  removeProviderConfig,
  removeProviderModel,
  STORAGE_KEY,
} from "@/features/providers/storage";
import {
  getCustomPrompts,
  removeCustomPrompt,
  saveCustomPrompt,
  updateCustomPrompt,
} from "@/features/storage/custom-prompts";
import type {
  AIProvider,
  ConfiguredProviderDetail,
  CustomPromptDefinition,
  OptionsSettings,
  OptionsState,
  SectionId,
} from "@/types";

export function useOptionsState(): OptionsState {
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<OptionsSettings>(defaultSettings);

  const [providerSummary, setProviderSummary] = useState<Awaited<
    ReturnType<typeof getProviderSummary>
  > | null>(null);
  const [configuredProviderDetails, setConfiguredProviderDetails] = useState<
    ConfiguredProviderDetail[]
  >([]);
  const [customPrompts, setCustomPrompts] = useState<CustomPromptDefinition[]>(
    []
  );
  const [selectedProvider, setSelectedProvider] =
    useState<AIProvider>("openai");

  useEffect(() => {
    document.title = OPTIONS_PAGE_TITLE;

    let descriptionMeta = document.querySelector<HTMLMetaElement>(
      "meta[name='description']"
    );
    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.name = "description";
      document.head.append(descriptionMeta);
    }
    descriptionMeta.content = OPTIONS_PAGE_DESCRIPTION;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const storedSettings = await storage.getItem<Partial<OptionsSettings>>(
          `local:${SETTINGS_KEY}`
        );

        if (!mounted) {
          return;
        }

        if (storedSettings) {
          setSettings({ ...defaultSettings, ...storedSettings });
        }
      } catch {
        // Ignore storage failures and continue with defaults.
      } finally {
        if (mounted) {
          setLoaded(true);
        }
      }
    }

    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    void storage.setItem(`local:${SETTINGS_KEY}`, settings);
  }, [loaded, settings]);

  useEffect(() => {
    let mounted = true;
    async function hydrateProviders() {
      const [summary, details] = await Promise.all([
        getProviderSummary(),
        getConfiguredProviderDetails(),
      ]);
      if (!mounted) {
        return;
      }
      setProviderSummary(summary);
      setConfiguredProviderDetails(details);
      setSelectedProvider(summary.defaultProvider);
      setSettings((previous) => ({
        ...previous,
        defaultProvider: summary.defaultProvider,
      }));
    }
    void hydrateProviders();
    return () => {
      mounted = false;
    };
  }, []);

  // storage.watch returns `Unwatch` (() => void); returning it directly cleans
  // up the subscription on unmount. react-doctor only recognizes
  // cleanup-returning APIs named subscribe/sub/listen, so it cannot verify
  // .watch()'s handle.
  // oxlint-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(
    () =>
      storage.watch(`local:${STORAGE_KEY}`, async () => {
        const [summary, details] = await Promise.all([
          getProviderSummary(),
          getConfiguredProviderDetails(),
        ]);
        setProviderSummary(summary);
        setConfiguredProviderDetails(details);
        setSettings((previous) => ({
          ...previous,
          defaultProvider: summary.defaultProvider,
        }));
      }),
    []
  );

  useEffect(() => {
    let mounted = true;

    async function hydrateCustomPrompts() {
      const prompts = await getCustomPrompts();
      if (!mounted) {
        return;
      }
      setCustomPrompts(prompts);
    }

    void hydrateCustomPrompts();
    return () => {
      mounted = false;
    };
  }, []);

  const unconfiguredProviders =
    providerSummary?.unconfiguredProviders.length ?? 0;

  async function refreshProviderData() {
    const [summary, details] = await Promise.all([
      getProviderSummary(),
      getConfiguredProviderDetails(),
    ]);
    setProviderSummary(summary);
    setConfiguredProviderDetails(details);
    setSettings((previous) => ({
      ...previous,
      defaultProvider: summary.defaultProvider,
    }));
  }

  function handleEditProvider(provider: AIProvider, _model?: string) {
    setSelectedProvider(provider);
  }

  async function handleDeleteProvider(provider: AIProvider, model?: string) {
    if (model) {
      await removeProviderModel(provider, model);
    } else {
      await removeProviderConfig(provider);
    }
    const [summary, details] = await Promise.all([
      getProviderSummary(),
      getConfiguredProviderDetails(),
    ]);
    setProviderSummary(summary);
    setConfiguredProviderDetails(details);
    if (provider === selectedProvider && details.length === 0) {
      setSelectedProvider(summary.defaultProvider);
    }
  }

  async function refreshCustomPrompts() {
    setCustomPrompts(await getCustomPrompts());
  }

  async function handleSaveCustomPrompt(
    title: string,
    prompt: string,
    promptId?: string
  ) {
    if (promptId) {
      await updateCustomPrompt(promptId, title, prompt);
    } else {
      await saveCustomPrompt(title, prompt);
    }
    await refreshCustomPrompts();
  }

  async function handleDeleteCustomPrompt(promptId: string) {
    await removeCustomPrompt(promptId);
    await refreshCustomPrompts();
  }

  function resetAllData() {
    setSettings(defaultSettings);
  }

  function exportSettings() {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      version: "1.0.0",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "promptpen-settings.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return {
    activeSection,
    configuredProviderDetails,
    customPrompts,
    exportSettings,
    handleDeleteCustomPrompt,
    handleDeleteProvider,
    handleEditProvider,
    handleSaveCustomPrompt,
    loaded,
    providerSummary,
    refreshProviderData,
    resetAllData,
    selectedProvider,
    setActiveSection,
    setSelectedProvider,
    setSettings,
    settings,
    unconfiguredProviders,
  };
}
