import { storage } from "@wxt-dev/storage"
import { useEffect, useMemo, useState } from "react"
import { getProviderDefinition } from "@/features/providers/catalog"
import { testProviderConnectionWithValues } from "@/features/providers/sdk"
import {
  type ConfiguredProviderDetail,
  getConfiguredProviderDetails,
  getDecryptedApiKey,
  getProviderEditorState,
  getProviderSummary,
  removeProviderConfig,
  saveProviderConfig,
  setDefaultProvider,
} from "@/features/providers/storage"
import type { AIProvider } from "@/types"
import {
  type SectionId,
  type CustomPrompt,
  type OptionsSettings,
} from "../types"
import {
  defaultSettings,
  defaultShortcuts,
  OPTIONS_PAGE_DESCRIPTION,
  OPTIONS_PAGE_TITLE,
  PROMPTS_KEY,
  SETTINGS_KEY,
  SHORTCUTS_KEY,
} from "@/constants/options"

export interface OptionsState {
  activeSection: SectionId
  setActiveSection: (id: SectionId) => void
  loaded: boolean
  settings: OptionsSettings
  setSettings: React.Dispatch<React.SetStateAction<OptionsSettings>>
  shortcuts: Record<string, string>
  setShortcuts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  customPrompts: CustomPrompt[]
  promptTitle: string
  setPromptTitle: React.Dispatch<React.SetStateAction<string>>
  promptContent: string
  setPromptContent: React.Dispatch<React.SetStateAction<string>>
  promptCategory: string
  setPromptCategory: React.Dispatch<React.SetStateAction<string>>
  providerSummary: Awaited<ReturnType<typeof getProviderSummary>> | null
  configuredProviderDetails: ConfiguredProviderDetail[]
  selectedProvider: AIProvider
  setSelectedProvider: React.Dispatch<React.SetStateAction<AIProvider>>
  providerModel: string
  setProviderModel: React.Dispatch<React.SetStateAction<string>>
  apiKey: string
  setApiKey: React.Dispatch<React.SetStateAction<string>>
  hasStoredApiKey: boolean
  isSavingProvider: boolean
  isTestingProvider: boolean
  connectionVerified: boolean
  providerStatusMessage: string
  providerStatusType: "idle" | "success" | "error"
  selectedProviderDefinition: ReturnType<typeof getProviderDefinition>
  unconfiguredProviders: number
  handleSaveProvider: () => Promise<void>
  handleTestProvider: () => Promise<void>
  handleEditProvider: (provider: AIProvider) => Promise<void>
  handleDeleteProvider: (provider: AIProvider) => Promise<void>
  addCustomPrompt: () => void
  removeCustomPrompt: (promptId: string) => void
  toggleQuickAction: (actionId: string) => void
  updateShortcut: (shortcutId: string, nextValue: string) => void
  resetAllData: () => void
  exportSettings: () => void
}

export function useOptionsState(): OptionsState {
  const [activeSection, setActiveSection] = useState<SectionId>("general")
  const [loaded, setLoaded] = useState(false)
  const [settings, setSettings] = useState<OptionsSettings>(defaultSettings)
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(defaultShortcuts)
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([])
  const [promptTitle, setPromptTitle] = useState("")
  const [promptContent, setPromptContent] = useState("")
  const [promptCategory, setPromptCategory] = useState("custom")

  const [providerSummary, setProviderSummary] = useState<Awaited<
    ReturnType<typeof getProviderSummary>
  > | null>(null)
  const [configuredProviderDetails, setConfiguredProviderDetails] = useState<
    ConfiguredProviderDetail[]
  >([])
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("openai")
  const [providerModel, setProviderModel] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [hasStoredApiKey, setHasStoredApiKey] = useState(false)
  const [isSavingProvider, setIsSavingProvider] = useState(false)
  const [isTestingProvider, setIsTestingProvider] = useState(false)
  const [connectionVerified, setConnectionVerified] = useState(false)
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
        const [storedSettings, storedShortcuts, storedPrompts] = await Promise.all([
          storage.getItem<Partial<OptionsSettings>>(`local:${SETTINGS_KEY}`),
          storage.getItem<Record<string, string>>(`local:${SHORTCUTS_KEY}`),
          storage.getItem<CustomPrompt[]>(`local:${PROMPTS_KEY}`),
        ])

        if (!mounted) return

        if (storedSettings) {
          setSettings({ ...defaultSettings, ...storedSettings })
        }
        if (storedShortcuts) {
          setShortcuts({ ...defaultShortcuts, ...storedShortcuts })
        }
        if (Array.isArray(storedPrompts)) {
          setCustomPrompts(storedPrompts)
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
    if (!loaded) return
    void storage.setItem(`local:${SHORTCUTS_KEY}`, shortcuts)
  }, [loaded, shortcuts])

  useEffect(() => {
    if (!loaded) return
    void storage.setItem(`local:${PROMPTS_KEY}`, customPrompts)
  }, [customPrompts, loaded])

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
    }
    void hydrateProviders()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function hydrateProviderEditor() {
      const editorState = await getProviderEditorState(selectedProvider)
      if (!mounted) return

      setProviderModel(editorState.model)
      setHasStoredApiKey(editorState.hasApiKey)
      setApiKey("")
      setProviderStatusType("idle")
      setProviderStatusMessage("")
    }
    void hydrateProviderEditor()
    return () => {
      mounted = false
    }
  }, [selectedProvider])

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on form value changes
  useEffect(() => {
    setConnectionVerified(false)
  }, [selectedProvider, providerModel, apiKey])

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
      setProviderStatusMessage("Provider settings saved.")

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
    setConnectionVerified(false)
    setProviderStatusType("idle")
    setProviderStatusMessage("")

    try {
      const result = await testProviderConnectionWithValues(
        selectedProvider,
        normalizedModel,
        resolvedApiKey,
      )
      if (result.ok) {
        setConnectionVerified(true)
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

  async function handleEditProvider(provider: AIProvider) {
    const editorState = await getProviderEditorState(provider)
    setSelectedProvider(provider)
    setProviderModel(editorState.model)
    setHasStoredApiKey(editorState.hasApiKey)
    setApiKey("")
    setProviderStatusType("idle")
    setProviderStatusMessage("")
    setConnectionVerified(false)
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
      setSelectedProvider(summary.defaultProvider)
    }
  }

  function addCustomPrompt() {
    if (!promptTitle.trim() || !promptContent.trim()) return

    setCustomPrompts((previous) => [
      ...previous,
      {
        id: `custom-${Date.now()}`,
        title: promptTitle.trim(),
        content: promptContent.trim(),
        category: promptCategory,
      },
    ])

    setPromptTitle("")
    setPromptContent("")
    setPromptCategory("custom")
  }

  function removeCustomPrompt(promptId: string) {
    setCustomPrompts((previous) => previous.filter((prompt) => prompt.id !== promptId))
  }

  function toggleQuickAction(actionId: string) {
    setSettings((previous) => {
      const included = previous.quickActions.includes(actionId)
      return {
        ...previous,
        quickActions: included
          ? previous.quickActions.filter((action) => action !== actionId)
          : [...previous.quickActions, actionId],
      }
    })
  }

  function updateShortcut(shortcutId: string, nextValue: string) {
    setShortcuts((previous) => ({ ...previous, [shortcutId]: nextValue }))
  }

  function resetAllData() {
    setSettings(defaultSettings)
    setShortcuts(defaultShortcuts)
    setCustomPrompts([])
  }

  function exportSettings() {
    const payload = {
      settings,
      shortcuts,
      customPrompts,
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
    shortcuts,
    setShortcuts,
    customPrompts,
    promptTitle,
    setPromptTitle,
    promptContent,
    setPromptContent,
    promptCategory,
    setPromptCategory,
    providerSummary,
    configuredProviderDetails,
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
    handleEditProvider,
    handleDeleteProvider,
    addCustomPrompt,
    removeCustomPrompt,
    toggleQuickAction,
    updateShortcut,
    resetAllData,
    exportSettings,
  }
}
