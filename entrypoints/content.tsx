import { createRoot } from "react-dom/client"
import { storage } from "@wxt-dev/storage"
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root"
import { ContextualToolbar } from "@/components/contextual-toolbar"
import { useToolbarStore } from "@/stores/toolbar"
import { getHostnameFromUrl, isWebsiteExcluded } from "@/features/storage/website-access"
import { useEffect, useRef } from "react"
import "@/assets/tailwind.css"

type Theme = "light" | "dark" | "system"
let shadowRootEl: HTMLElement | null = null

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme
}

function applyTheme(theme: Theme) {
  if (!shadowRootEl) return
  const resolved = resolveTheme(theme)
  shadowRootEl.classList.toggle("pp-dark", resolved === "dark")
}

function isTextInputElement(element: Element | null): element is HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    return false
  }

  const textInputTypes = new Set(["text", "search", "url", "tel", "email"])

  return textInputTypes.has(element.type)
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
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unwatch = storage.watch<Theme>("sync:promptpen-theme", (newTheme) => {
      if (!newTheme) return
      applyTheme(newTheme)
    })
    return () => {
      if (typeof unwatch === "function") unwatch()
    }
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

  return <ContextualToolbar />
}

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  cssInjectionMode: "ui",
  async main(ctx) {
    const hostname = getHostnameFromUrl(window.location.href)
    if (hostname && await isWebsiteExcluded(hostname)) {
      return
    }

    const ui = await createShadowRootUi(ctx, {
      name: "promptpen-root",
      mode: "closed",
      position: "inline",
      anchor: "body",
      onMount(uiContainer) {
        const rootEl = document.createElement("div")
        rootEl.id = "pp:root"
        uiContainer.append(rootEl)

        shadowRootEl = rootEl
        void storage.getItem<Theme>("sync:promptpen-theme").then((stored) => {
          applyTheme(stored ?? "system")
        })

        const root = createRoot(rootEl)
        root.render(<ContentScript />)
        return { root }
      },
      onRemove(mounted) {
        mounted?.root.unmount()
        shadowRootEl = null
      },
    })

    ui.mount()
  },
})
