import { storage } from "@wxt-dev/storage"
import { browser } from "wxt/browser"
import {
  DEFAULT_PROVIDER,
  getProviderDefinition,
  PROVIDER_DEFINITIONS,
} from "./registry"
import type {
  AIProvider,
  ProviderRuntimeConfig,
  ProviderSummary,
  ConfiguredProviderDetail,
  ProviderEditorState,
} from "@/types"

export const STORAGE_KEY = "promptpen.providers.v1"
const ENCRYPTION_SALT = "promptpen/providers/config"

interface EncryptedPayload {
  ciphertext: string
  iv: string
}

interface StoredProviderConfig {
  model: string
  encryptedApiKey?: EncryptedPayload
  baseUrl?: string
  encryptedAccessToken?: EncryptedPayload
  updatedAt: number
}

interface StoredProviderState {
  defaultProvider: AIProvider
  providers: Partial<Record<AIProvider, StoredProviderConfig>>
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes.buffer
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const seed = `${browser.runtime.id}:${ENCRYPTION_SALT}`
  const seedDigest = await crypto.subtle.digest("SHA-256", encoder.encode(seed))

  return crypto.subtle.importKey("raw", seedDigest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ])
}

async function encryptString(value: string): Promise<EncryptedPayload> {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(value),
  )

  return {
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv.buffer),
  }
}

async function decryptString(payload: EncryptedPayload): Promise<string | null> {
  try {
    const key = await getEncryptionKey()
    const iv = fromBase64(payload.iv)
    const ciphertext = fromBase64(payload.ciphertext)
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)

    return decoder.decode(plaintext)
  } catch {
    return null
  }
}

async function readState(): Promise<StoredProviderState> {
  const state = await storage.getItem<StoredProviderState>(`local:${STORAGE_KEY}`)
  if (state) {
    return state
  }

  return {
    defaultProvider: DEFAULT_PROVIDER,
    providers: {},
  }
}

async function writeState(state: StoredProviderState): Promise<void> {
  await storage.setItem(`local:${STORAGE_KEY}`, state)
}

function getProviderModel(provider: AIProvider): string {
  return getProviderDefinition(provider).defaultModel
}

export async function saveProviderConfig(
  provider: AIProvider,
  model: string,
  apiKey?: string,
  baseUrl?: string,
  accessToken?: string,
): Promise<void> {
  const state = await readState()
  const existingConfig = state.providers[provider]
  const providerDefinition = getProviderDefinition(provider)
  const isSelfHosted = providerDefinition.category === "self-hosted"

  let encryptedApiKey = existingConfig?.encryptedApiKey

  if (apiKey?.trim()) {
    encryptedApiKey = await encryptString(apiKey.trim())
  } else if (isSelfHosted && !encryptedApiKey) {
    encryptedApiKey = undefined
  }

  let encryptedAccessToken = existingConfig?.encryptedAccessToken

  if (accessToken?.trim()) {
    encryptedAccessToken = await encryptString(accessToken.trim())
  } else if (accessToken !== undefined && !accessToken.trim()) {
    encryptedAccessToken = undefined
  }

  state.providers[provider] = {
    model: model.trim() || getProviderModel(provider),
    encryptedApiKey,
    baseUrl: baseUrl?.trim() || existingConfig?.baseUrl,
    encryptedAccessToken,
    updatedAt: Date.now(),
  }

  await writeState(state)
}

export async function setDefaultProvider(provider: AIProvider): Promise<void> {
  const state = await readState()
  state.defaultProvider = provider
  await writeState(state)
}

export async function getProviderSummary(): Promise<ProviderSummary> {
  const state = await readState()
  const configuredProviders: AIProvider[] = []
  const unconfiguredProviders: AIProvider[] = []

  for (const provider of PROVIDER_DEFINITIONS) {
    const config = state.providers[provider.id]
    const isSelfHosted = provider.category === "self-hosted"
    if (isSelfHosted ? config : config?.encryptedApiKey) {
      configuredProviders.push(provider.id)
    } else {
      unconfiguredProviders.push(provider.id)
    }
  }

  const defaultDefinition = getProviderDefinition(state.defaultProvider)
  const defaultModel =
    state.providers[state.defaultProvider]?.model ?? defaultDefinition.defaultModel

  return {
    configuredProviders,
    unconfiguredProviders,
    defaultProvider: state.defaultProvider,
    defaultModel,
  }
}

export async function getRuntimeConfig(
  requestedProvider?: AIProvider,
): Promise<ProviderRuntimeConfig | null> {
  const state = await readState()
  const provider = requestedProvider ?? state.defaultProvider
  const providerDefinition = getProviderDefinition(provider)
  const config = state.providers[provider]

  const isSelfHosted = providerDefinition.category === "self-hosted"

  if (isSelfHosted) {
    if (!config) {
      return null
    }
    const accessToken = config.encryptedAccessToken
      ? await decryptString(config.encryptedAccessToken)
      : undefined
    return {
      provider,
      model: config?.model ?? providerDefinition.defaultModel,
      apiKey: "",
      baseUrl: config?.baseUrl,
      accessToken: accessToken || undefined,
    }
  }

  const encryptedApiKey = config?.encryptedApiKey
  if (!encryptedApiKey) {
    return null
  }

  const apiKey = await decryptString(encryptedApiKey)
  if (!apiKey) {
    return null
  }

  return {
    provider,
    model: config?.model ?? providerDefinition.defaultModel,
    apiKey,
    baseUrl: config?.baseUrl,
  }
}

export async function getDecryptedApiKey(provider: AIProvider): Promise<string | null> {
  const state = await readState()
  const config = state.providers[provider]
  if (!config?.encryptedApiKey) {
    return null
  }
  return decryptString(config.encryptedApiKey)
}

export async function getProviderEditorState(provider: AIProvider): Promise<ProviderEditorState> {
  const state = await readState()
  const config = state.providers[provider]

  return {
    model: config?.model ?? getProviderModel(provider),
    hasApiKey: Boolean(config?.encryptedApiKey),
  }
}

export async function getDecryptedAccessToken(provider: AIProvider): Promise<string | null> {
  const state = await readState()
  const config = state.providers[provider]
  if (!config?.encryptedAccessToken) {
    return null
  }
  return decryptString(config.encryptedAccessToken)
}

export async function removeProviderConfig(provider: AIProvider): Promise<void> {
  const state = await readState()
  delete state.providers[provider]
  if (state.defaultProvider === provider) {
    const remaining = Object.keys(state.providers) as AIProvider[]
    state.defaultProvider = remaining.length > 0 ? remaining[0] : DEFAULT_PROVIDER
  }
  await writeState(state)
}

export async function getConfiguredProviderDetails(): Promise<ConfiguredProviderDetail[]> {
  const state = await readState()
  const details: ConfiguredProviderDetail[] = []

  for (const provider of PROVIDER_DEFINITIONS) {
    const config = state.providers[provider.id]
    if (!config) continue
    const isConfigured = provider.category === "self-hosted" || !!config.encryptedApiKey
    if (!isConfigured) continue
    details.push({
      provider: provider.id,
      label: provider.label,
      model: config.model ?? provider.defaultModel,
      updatedAt: config.updatedAt,
    })
  }

  return details.sort((a, b) => b.updatedAt - a.updatedAt)
}
