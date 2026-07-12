import { createRoot } from "react-dom/client"
import { storage } from "@wxt-dev/storage"
import { ContextualToolbar } from "@/components/contextual-toolbar"
import { createProviderAdapter } from "@/features/providers/sdk"
import { useToolbarStore } from "@/stores/toolbar"
import { useEffect, useRef, useState } from "react"
import "@/assets/tailwind.css"

const OPTIONS_SETTINGS_KEY = "promptpen.options.settings.v1"
const MIN_CONTEXT_CHARS = 28
const MAX_CONTEXT_CHARS = 260
const REQUEST_DEBOUNCE_MS = 550
const REQUEST_COOLDOWN_MS = 1800
const CACHE_TTL_MS = 60_000
const CACHE_LIMIT = 50

interface SuggestionSettings {
  autoSuggest: boolean
  excludedSites: string[]
  privacyMode: boolean
}

interface SuggestionCacheEntry {
  value: string
  at: number
}

const DEFAULT_SUGGESTION_SETTINGS: SuggestionSettings = {
  autoSuggest: true,
  excludedSites: [],
  privacyMode: false,
}

function applyThemeToPage(theme: string) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  const resolved = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

function isTextInputElement(element: Element | null): element is HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    return false
  }

  const textInputTypes = new Set(["text", "search", "url", "tel", "email"])

  return textInputTypes.has(element.type)
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/^www\./, "")
}

function matchesSitePattern(hostname: string, pattern: string): boolean {
  const normalizedHost = normalizeHostname(hostname)
  const normalizedPattern = normalizeHostname(pattern)

  if (!normalizedPattern) {
    return false
  }

  if (normalizedPattern.startsWith("*.")) {
    const suffix = normalizedPattern.slice(2)
    return normalizedHost === suffix || normalizedHost.endsWith(`.${suffix}`)
  }

  return normalizedHost === normalizedPattern || normalizedHost.endsWith(`.${normalizedPattern}`)
}

function shouldSkipSuggestions(settings: SuggestionSettings): boolean {
  if (!settings.autoSuggest || settings.privacyMode) {
    return true
  }

  const hostname = normalizeHostname(window.location.hostname)
  return settings.excludedSites.some((pattern) => matchesSitePattern(hostname, pattern))
}

function shouldTriggerByBoundary(text: string): boolean {
  return /[\s,.!?;:]$/.test(text)
}

function buildSuggestionPrompt(context: string): string {
  return [
    "Continue the user's text with one short, natural suggestion.",
    "Rules:",
    "- Return only continuation text, no quotes, no explanation.",
    "- Keep it concise (max 12 words).",
    "- Match the existing tone and language.",
    "- Do not repeat existing words unnecessarily.",
    "",
    "Current text:",
    `"""${context}"""`,
  ].join("\n")
}

function trimSuggestion(input: string): string {
  return input.replace(/^\s+/, " ").replace(/\s+/g, " ").trimEnd()
}

async function readSuggestionSettings(): Promise<SuggestionSettings> {
  try {
    const raw = await storage.getItem<Partial<SuggestionSettings>>(`local:${OPTIONS_SETTINGS_KEY}`)

    return {
      autoSuggest: raw?.autoSuggest ?? DEFAULT_SUGGESTION_SETTINGS.autoSuggest,
      excludedSites: Array.isArray(raw?.excludedSites)
        ? raw.excludedSites.filter((value) => typeof value === "string")
        : DEFAULT_SUGGESTION_SETTINGS.excludedSites,
      privacyMode: raw?.privacyMode ?? DEFAULT_SUGGESTION_SETTINGS.privacyMode,
    }
  } catch {
    return DEFAULT_SUGGESTION_SETTINGS
  }
}

function isSelectionInEditableNode(range: Range): boolean {
  const nodes: Node[] = [range.commonAncestorContainer, range.startContainer, range.endContainer]

  for (const node of nodes) {
    const element = node instanceof HTMLElement ? node : node.parentElement
    if (element?.isContentEditable) {
      return true
    }
  }

  return false
}

function getSelectionRect(): DOMRect | null {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !selection.rangeCount) {
    return null
  }

  const range = selection.getRangeAt(0)
  return range.getBoundingClientRect()
}

function getSelectionRange(): Range | null {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !selection.rangeCount) {
    return null
  }

  return selection.getRangeAt(0).cloneRange()
}

function getSelectedText(): string {
  return window.getSelection()?.toString().trim() ?? ""
}

function getTextControlSelection(): { text: string; rect: DOMRect } | null {
  const activeElement = document.activeElement

  if (activeElement instanceof HTMLTextAreaElement) {
    const start = activeElement.selectionStart ?? 0
    const end = activeElement.selectionEnd ?? 0
    if (end <= start) {
      return null
    }

    const text = activeElement.value.slice(start, end).trim()
    if (!text) {
      return null
    }

    return {
      text,
      rect: activeElement.getBoundingClientRect(),
    }
  }

  if (isTextInputElement(activeElement)) {
    const start = activeElement.selectionStart ?? 0
    const end = activeElement.selectionEnd ?? 0
    if (end <= start) {
      return null
    }

    const text = activeElement.value.slice(start, end).trim()
    if (!text) {
      return null
    }

    return {
      text,
      rect: activeElement.getBoundingClientRect(),
    }
  }

  return null
}

function ContentScript() {
  const { show, hide, isPinned } = useToolbarStore()
  const [themeVersion, setThemeVersion] = useState(0)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const settingsRef = useRef<SuggestionSettings>(DEFAULT_SUGGESTION_SETTINGS)
  const cacheRef = useRef<Map<string, SuggestionCacheEntry>>(new Map())
  const requestSequenceRef = useRef(0)
  const lastRequestAtRef = useRef(0)
  const activeTargetRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const suggestionRef = useRef("")
  const [suggestion, setSuggestion] = useState("")
  const [suggestionRect, setSuggestionRect] = useState<DOMRect | null>(null)

  function clearSuggestion() {
    setSuggestion("")
    suggestionRef.current = ""
    setSuggestionRect(null)
  }

  function updateSuggestionRect(target: HTMLInputElement | HTMLTextAreaElement) {
    setSuggestionRect(target.getBoundingClientRect())
  }

  async function requestSuggestion(context: string): Promise<string> {
    const cacheKey = context.toLowerCase()
    const now = Date.now()
    const existing = cacheRef.current.get(cacheKey)

    if (existing && now - existing.at <= CACHE_TTL_MS) {
      return existing.value
    }

    const adapter = await createProviderAdapter()
    if (!adapter) {
      return ""
    }

    const response = await adapter.runPrompt(
      buildSuggestionPrompt(context),
      "You are a typing assistant for inline completions.",
    )

    const normalized = trimSuggestion(response)
    if (!normalized) {
      return ""
    }

    cacheRef.current.set(cacheKey, { value: normalized, at: now })
    if (cacheRef.current.size > CACHE_LIMIT) {
      const oldestKey = cacheRef.current.keys().next().value
      if (oldestKey) {
        cacheRef.current.delete(oldestKey)
      }
    }

    return normalized
  }

  function tryApplySuggestion(event: KeyboardEvent): boolean {
    if (!suggestion) {
      return false
    }

    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      return false
    }

    if (target !== activeTargetRef.current) {
      return false
    }

    const cursor = target.selectionStart ?? target.value.length
    const before = target.value.slice(0, cursor)
    const after = target.value.slice(cursor)
    const nextValue = `${before}${suggestion}${after}`

    target.value = nextValue
    const nextCursor = cursor + suggestion.length
    target.selectionStart = nextCursor
    target.selectionEnd = nextCursor
    target.dispatchEvent(new Event("input", { bubbles: true }))
    clearSuggestion()
    return true
  }

  function handleEditableInput(target: HTMLInputElement | HTMLTextAreaElement) {
    activeTargetRef.current = target
    clearSuggestion()

    if (shouldSkipSuggestions(settingsRef.current)) {
      return
    }

    if (target.selectionStart !== target.selectionEnd) {
      return
    }

    const cursor = target.selectionStart ?? target.value.length
    if (cursor !== target.value.length) {
      return
    }

    const typed = target.value.slice(0, cursor)
    if (typed.length < MIN_CONTEXT_CHARS || !shouldTriggerByBoundary(typed)) {
      return
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      const now = Date.now()
      if (now - lastRequestAtRef.current < REQUEST_COOLDOWN_MS) {
        return
      }

      const context = typed.slice(-MAX_CONTEXT_CHARS)
      const requestId = requestSequenceRef.current + 1
      requestSequenceRef.current = requestId
      lastRequestAtRef.current = now

      void requestSuggestion(context)
        .then((result) => {
          if (requestSequenceRef.current !== requestId) {
            return
          }
          if (!result) {
            clearSuggestion()
            return
          }

          const latestTarget = activeTargetRef.current
          if (!latestTarget || latestTarget !== target) {
            return
          }

          suggestionRef.current = result
          setSuggestion(result)
          updateSuggestionRect(target)
        })
        .catch(() => {
          if (requestSequenceRef.current === requestId) {
            clearSuggestion()
          }
        })
    }, REQUEST_DEBOUNCE_MS)
  }

  useEffect(() => {
    const unwatch = storage.watch<string>("local:theme", (newTheme) => {
      if (!newTheme) return
      localStorage.setItem("promptpen-theme", newTheme)
      applyThemeToPage(newTheme)
      setThemeVersion((v) => v + 1)
    })
    return unwatch
  }, [])

  useEffect(() => {
    function handleSelection() {
      if (isPinned) {
        return
      }

      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current)
      }

      const textControlSelection = getTextControlSelection()
      if (textControlSelection) {
        show(textControlSelection.text, textControlSelection.rect, null, true)
        return
      }

      const text = getSelectedText()
      if (!text) {
        hideTimeout.current = setTimeout(() => hide(), 200)
        return
      }

      const rect = getSelectionRect()
      const range = getSelectionRange()
      if (!rect) {
        hide()
        return
      }

      if (!range) {
        hide()
        return
      }

      show(text, rect, range, isSelectionInEditableNode(range))
    }

    document.addEventListener("mouseup", handleSelection, true)
    document.addEventListener("selectionchange", handleSelection, true)
    document.addEventListener("keyup", handleSelection, true)

    return () => {
      document.removeEventListener("mouseup", handleSelection, true)
      document.removeEventListener("selectionchange", handleSelection, true)
      document.removeEventListener("keyup", handleSelection, true)
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current)
      }
    }
  }, [isPinned, show, hide])

  useEffect(() => {
    let mounted = true

    async function hydrateSuggestionSettings() {
      const settings = await readSuggestionSettings()
      if (!mounted) {
        return
      }
      settingsRef.current = settings
      if (shouldSkipSuggestions(settings)) {
        clearSuggestion()
      }
    }

    void hydrateSuggestionSettings()

    const unwatch = storage.watch<Partial<SuggestionSettings>>(`local:${OPTIONS_SETTINGS_KEY}`, (newValue) => {
      const next = newValue ?? DEFAULT_SUGGESTION_SETTINGS
      settingsRef.current = {
        autoSuggest: next.autoSuggest ?? DEFAULT_SUGGESTION_SETTINGS.autoSuggest,
        excludedSites: Array.isArray(next.excludedSites)
          ? next.excludedSites.filter((value) => typeof value === "string")
          : DEFAULT_SUGGESTION_SETTINGS.excludedSites,
        privacyMode: next.privacyMode ?? DEFAULT_SUGGESTION_SETTINGS.privacyMode,
      }

      if (shouldSkipSuggestions(settingsRef.current)) {
        clearSuggestion()
      }
    })

    function onInput(event: Event) {
      const target = event.target
      if (target instanceof HTMLTextAreaElement) {
        handleEditableInput(target)
        return
      }

      if (target instanceof Element && isTextInputElement(target)) {
        handleEditableInput(target)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearSuggestion()
        return
      }

      if (event.key === "Tab" && tryApplySuggestion(event)) {
        event.preventDefault()
      }
    }

    function onScrollOrResize() {
      const target = activeTargetRef.current
      if (!target || !suggestionRef.current) {
        return
      }
      updateSuggestionRect(target)
    }

    document.addEventListener("input", onInput, true)
    document.addEventListener("keydown", onKeyDown, true)
    window.addEventListener("scroll", onScrollOrResize, true)
    window.addEventListener("resize", onScrollOrResize, true)

    return () => {
      mounted = false
      unwatch()
      document.removeEventListener("input", onInput, true)
      document.removeEventListener("keydown", onKeyDown, true)
      window.removeEventListener("scroll", onScrollOrResize, true)
      window.removeEventListener("resize", onScrollOrResize, true)
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  return (
    <>
      <ContextualToolbar key={themeVersion} />
      {suggestion && suggestionRect ? (
        <div
          className="fixed z-2147483647 max-w-md rounded-md border bg-card px-3 py-2 text-xs text-card-foreground shadow-xl"
          style={{
            top: `${suggestionRect.bottom + 6}px`,
            left: `${suggestionRect.left}px`,
            width: `${Math.min(suggestionRect.width, 420)}px`,
          }}
        >
          <p className="line-clamp-2 whitespace-pre-wrap wrap-break-word">{suggestion}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Tab to accept • Esc to dismiss</p>
        </div>
      ) : null}
    </>
  )
}

async function preloadTheme() {
  try {
    const theme = await storage.getItem<string>("local:theme")
    if (theme) {
      localStorage.setItem("promptpen-theme", theme)
      applyThemeToPage(theme)
    }
  } catch {}
}

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  async main(ctx) {
    await preloadTheme()

    const container = document.createElement("div")
    container.id = "promptpen-root"
    document.body.append(container)

    const root = createRoot(container)
    root.render(<ContentScript />)

    ctx.onInvalidated(() => {
      root.unmount()
      container.remove()
    })
  },
})
