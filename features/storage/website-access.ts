import { storage } from "@wxt-dev/storage"
import type { WebsiteRule } from "@/types"

const WEBSITE_ACCESS_STORAGE_KEY = "promptpen.website-access.v1"

interface WebsiteAccessState {
  enableEverywhere: boolean
  websiteRules: WebsiteRule[]
  excludedHostnames: string[]
}

const DEFAULT_STATE: WebsiteAccessState = {
  enableEverywhere: true,
  websiteRules: [],
  excludedHostnames: [],
}

function normalizeHostname(hostname: string): string {
  return hostname
    .trim()
    .toLowerCase()
    .replace(/^www\./, "")
}

export function getHostnameFromUrl(url: string): string {
  if (!url) {
    return ""
  }

  try {
    return normalizeHostname(new URL(url).hostname)
  } catch {
    return ""
  }
}

export function getHostnameFromInput(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  const withProtocol = trimmed.includes("://") ? trimmed : `https://${trimmed}`
  return getHostnameFromUrl(withProtocol)
}

export async function getWebsiteAccessState(): Promise<WebsiteAccessState> {
  const state = await storage.getItem<WebsiteAccessState>(`local:${WEBSITE_ACCESS_STORAGE_KEY}`)
  if (!state) {
    return DEFAULT_STATE
  }

  return {
    enableEverywhere:
      typeof state.enableEverywhere === "boolean"
        ? state.enableEverywhere
        : DEFAULT_STATE.enableEverywhere,
    websiteRules: Array.isArray(state.websiteRules) ? state.websiteRules : [],
    excludedHostnames: Array.isArray(state.excludedHostnames) ? state.excludedHostnames : [],
  }
}

async function writeWebsiteAccessState(state: WebsiteAccessState): Promise<void> {
  await storage.setItem(`local:${WEBSITE_ACCESS_STORAGE_KEY}`, state)
}

export async function isWebsiteExcluded(hostname: string): Promise<boolean> {
  const normalizedHostname = normalizeHostname(hostname)
  if (!normalizedHostname) return false
  const state = await getWebsiteAccessState()
  return state.excludedHostnames.includes(normalizedHostname)
}

export async function isWebsiteEnabled(hostname: string): Promise<boolean> {
  const normalizedHostname = normalizeHostname(hostname)
  if (!normalizedHostname) {
    return false
  }

  const state = await getWebsiteAccessState()
  if (state.excludedHostnames.includes(normalizedHostname)) {
    return false
  }

  if (state.enableEverywhere) {
    return true
  }

  const match = state.websiteRules.find((rule) => rule.hostname === normalizedHostname)
  return Boolean(match?.enabled)
}

export async function setWebsiteExcluded(hostname: string, excluded: boolean): Promise<void> {
  const normalizedHostname = normalizeHostname(hostname)
  if (!normalizedHostname) return

  const state = await getWebsiteAccessState()
  if (excluded) {
    if (!state.excludedHostnames.includes(normalizedHostname)) {
      state.excludedHostnames.push(normalizedHostname)
    }
    const existingIndex = state.websiteRules.findIndex((rule) => rule.hostname === normalizedHostname)
    if (existingIndex >= 0) {
      state.websiteRules.splice(existingIndex, 1)
    }
  } else {
    state.excludedHostnames = state.excludedHostnames.filter((h) => h !== normalizedHostname)
  }

  await writeWebsiteAccessState(state)
}

export async function setWebsiteEnabled(hostname: string, enabled: boolean): Promise<void> {
  const normalizedHostname = normalizeHostname(hostname)
  if (!normalizedHostname) {
    return
  }

  const state = await getWebsiteAccessState()
  const existingIndex = state.websiteRules.findIndex((rule) => rule.hostname === normalizedHostname)

  const rule: WebsiteRule = {
    id: normalizedHostname,
    hostname: normalizedHostname,
    enabled,
  }

  if (existingIndex >= 0) {
    state.websiteRules[existingIndex] = rule
  } else {
    state.websiteRules.push(rule)
  }

  await writeWebsiteAccessState(state)
}
