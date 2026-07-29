import { storage } from "@wxt-dev/storage"
import { useEffect, useState } from "react"
import { getProviderDefinition } from "@/features/providers/registry"
import { testProviderConnectionWithValues } from "@/features/providers/sdk"
import {
  getCustomPrompts,
  removeCustomPrompt,
  saveCustomPrompt,
  updateCustomPrompt,
} from "@/features/storage/custom-prompts"
import {
  getConfiguredProviderDetails,
  getDecryptedApiKey,
  getProviderEditorState,
  getProviderSummary,
  removeProviderConfig,
  saveProviderConfig,
  setDefaultProvider,
} from "@/features/providers/storage"
import type { AIProvider, ConfiguredProviderDetail, CustomPromptDefinition, OptionsState, SectionId, OptionsSettings } from "@/types"
import {
  defaultSettings,
  OPTIONS_PAGE_DESCRIPTION,
  OPTIONS_PAGE_TITLE,
  SETTINGS_KEY,
} from "@/constants/options"

export function useOptionsState(): OptionsState {
  const [activeSection, setActiveSection] = useState<SectionId>("general")
  const [loaded, setLoaded] = useState(false)
  const [settings, setSettings] = useState<OptionsSettings>(defaultSettings)

  const [providerSummary, setProviderSummary] = useState<Awaited<
    ReturnType<typeof getProviderSummary>
  > | null>(null)
  const [configuredProviderDetails, setConfiguredProviderDetails] = useState<
    ConfiguredProviderDetail[]
  >([])
  const [customPrompts, setCustomPrompts] = useState<CustomPromptDefinition[]>([])
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("openai")
  const [providerModel, setProviderModel] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [hasStoredApiKey, setHasStoredApiKey] = useState(false)
  const [isSavingProvider, setIsSavingProvider] = useState(false)
  const [isTestingProvider, setIsTestingProvider] = useState(false)
  const [verifiedFormKey, setVerifiedFormKey] = useState("")
  const connectionVerified = verifiedFormKey === `${selectedProvider}::${providerModel}::${apiKey}` && verifiedFormKey !== ""
  const [providerStatusMessage, setProviderStatusMessage] = useState("")
  const [providerStatusType, setProviderStatusType] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    document.title = OPTIONS_PAGE_TITLE

    let descriptionMeta = document.querySelector<HTMLMetaElement>("meta[name='description']")
    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta")
      descriptionMeta.name = "description"
      document.head.append(descriptionMeta)
    }
    descriptionMeta.content = OPTIONS_PAGE_DESCRIPTION
  }, [])

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      try {
        const storedSettings = await storage.getItem<Partial<OptionsSettings>>(`local:${SETTINGS_KEY}`)

        if (!mounted) return

        if (storedSettings) {
          setSettings({ ...defaultSettings, ...storedSettings })
        }
      } catch {
        // Ignore storage failures and continue with defaults.
      } finally {
        if (mounted) setLoaded(true)
      }
    }

    void hydrate()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    void storage.setItem(`local:${SETTINGS_KEY}`, settings)
  }, [loaded, settings])

  useEffect(() => {
    let mounted = true
    async function hydrateProviders() {
      const [summary, details] = await Promise.all([
        getProviderSummary(),
        getConfiguredProviderDetails(),
      ])
      if (!mounted) return
      setProviderSummary(summary)
      setConfiguredProviderDetails(details)
      setSelectedProvider(summary.defaultProvider)
      const editorState = await getProviderEditorState(summary.defaultProvider)
      if (!mounted) return
      setProviderModel(editorState.model)
      setHasStoredApiKey(editorState.hasApiKey)
    }
    void hydrateProviders()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function hydrateCustomPrompts() {
      const prompts = await getCustomPrompts()
      if (!mounted) return
      setCustomPrompts(prompts)
    }

    void hydrateCustomPrompts()
    return () => {
      mounted = false
    }
  }, [])

  const selectedProviderDefinition = getProviderDefinition(selectedProvider)
  const unconfiguredProviders = providerSummary?.unconfiguredProviders.length ?? 11

  async function refreshProviderSummary() {
    const summary = await getProviderSummary()
    setProviderSummary(summary)
  }

  async function handleSaveProvider() {
    if (!connectionVerified) {
      setProviderStatusType("error")
      setProviderStatusMessage("Test the connection before saving.")
      return
    }

    const normalizedModel = providerModel.trim()
    if (!normalizedModel) {
      setProviderStatusType("error")
      setProviderStatusMessage("Enter a model name before saving.")
      return
    }

    if (!hasStoredApiKey && !apiKey.trim()) {
      setProviderStatusType("error")
      setProviderStatusMessage("Enter an API key to configure this provider.")
      return
    }

    setIsSavingProvider(true)

    try {
      await saveProviderConfig(selectedProvider, normalizedModel, apiKey)
      await setDefaultProvider(selectedProvider)
      await refreshProviderSummary()
      setHasStoredApiKey(true)
      setApiKey("")
      setProviderStatusType("success")
      setProviderStatusMessage("Provider settings saved. Reload the website after saving for the AI provider to work.")

      setSettings((previous) => ({
        ...previous,
        defaultProvider: selectedProvider,
        defaultModel: normalizedModel,
      }))
    } catch {
      setProviderStatusType("error")
      setProviderStatusMessage("Failed to save provider settings.")
    } finally {
      setIsSavingProvider(false)
    }
  }

  async function handleTestProvider() {
    const normalizedModel = providerModel.trim()
    if (!normalizedModel) {
      setProviderStatusType("error")
      setProviderStatusMessage("Enter a model name before testing.")
      return
    }

    let resolvedApiKey = apiKey.trim()
    if (!resolvedApiKey && hasStoredApiKey) {
      const storedKey = await getDecryptedApiKey(selectedProvider)
      if (storedKey) resolvedApiKey = storedKey
    }

    if (!resolvedApiKey) {
      setProviderStatusType("error")
      setProviderStatusMessage("Enter an API key to test the connection.")
      return
    }

    setIsTestingProvider(true)
    setVerifiedFormKey("")
    setProviderStatusType("idle")
    setProviderStatusMessage("")

    try {
      const result = await testProviderConnectionWithValues(
        selectedProvider,
        normalizedModel,
        resolvedApiKey,
      )
      if (result.ok) {
        setVerifiedFormKey(`${selectedProvider}::${normalizedModel}::${resolvedApiKey}`)
        setProviderStatusType("success")
        setProviderStatusMessage("Connection successful. You can now save.")
      } else {
        setProviderStatusType("error")
        setProviderStatusMessage(
          `Connection failed. ${result.message ?? "Unknown provider error."}`,
        )
      }
    } catch {
      setProviderStatusType("error")
      setProviderStatusMessage("Connection test failed unexpectedly.")
    } finally {
      setIsTestingProvider(false)
    }
  }

  async function hydrateProviderEditor(provider: AIProvider) {
    const editorState = await getProviderEditorState(provider)
    setProviderModel(editorState.model)
    setHasStoredApiKey(editorState.hasApiKey)
    setApiKey("")
    setProviderStatusType("idle")
    setProviderStatusMessage("")
  }

  function selectProvider(provider: AIProvider) {
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setSelectedProvider(provider)
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    void hydrateProviderEditor(provider)
  }

  function handleEditProvider(provider: AIProvider) {
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    selectProvider(provider)
  }

  async function handleDeleteProvider(provider: AIProvider) {
    await removeProviderConfig(provider)
    const [summary, details] = await Promise.all([
      getProviderSummary(),
      getConfiguredProviderDetails(),
    ])
    setProviderSummary(summary)
    setConfiguredProviderDetails(details)
    if (provider === selectedProvider) {
      selectProvider(summary.defaultProvider)
    }
  }

  async function refreshCustomPrompts() {
    setCustomPrompts(await getCustomPrompts())
  }

  async function handleSaveCustomPrompt(title: string, prompt: string, promptId?: string) {
    if (promptId) {
      await updateCustomPrompt(promptId, title, prompt)
    } else {
      await saveCustomPrompt(title, prompt)
    }
    await refreshCustomPrompts()
  }

  async function handleDeleteCustomPrompt(promptId: string) {
    await removeCustomPrompt(promptId)
    await refreshCustomPrompts()
  }

  function resetAllData() {
    setSettings(defaultSettings)
  }

  function exportSettings() {
    const payload = {
      settings,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "promptpen-settings.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return {
    activeSection,
    setActiveSection,
    loaded,
    settings,
    setSettings,
    providerSummary,
    configuredProviderDetails,
    customPrompts,
    selectedProvider,
    setSelectedProvider,
    providerModel,
    setProviderModel,
    apiKey,
    setApiKey,
    hasStoredApiKey,
    isSavingProvider,
    isTestingProvider,
    connectionVerified,
    providerStatusMessage,
    providerStatusType,
    selectedProviderDefinition,
    unconfiguredProviders,
    handleSaveProvider,
    handleTestProvider,
    selectProvider,
    handleEditProvider,
    handleDeleteProvider,
    handleSaveCustomPrompt,
    handleDeleteCustomPrompt,
    resetAllData,
    exportSettings,
  }
}
