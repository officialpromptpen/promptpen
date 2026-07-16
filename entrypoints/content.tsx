import { createRoot } from "react-dom/client"
import { storage } from "@wxt-dev/storage"
import { ContextualToolbar } from "@/components/contextual-toolbar"
import { useToolbarStore } from "@/stores/toolbar"
import { getHostnameFromUrl, isWebsiteExcluded } from "@/features/storage/website-access"
import { useEffect, useRef, useState } from "react"
import tailwindStyles from "@/assets/tailwind.css?inline"

let shadowRootEl: HTMLElement | null = null

function applyThemeToShadowRoot(theme: string) {
  if (!shadowRootEl) return
  const resolved = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme
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

  // if (isTextInputElement(activeElement)) {
  //   const start = activeElement.selectionStart ?? 0
  //   const end = activeElement.selectionEnd ?? 0
  //   if (end <= start) {
  //     return null
  //   }

  //   const text = activeElement.value.slice(start, end).trim()
  //   if (!text) {
  //     return null
  //   }

  //   return {
  //     text,
  //     rect: activeElement.getBoundingClientRect(),
  //   }
  // }

  return null
}

function ContentScript() {
  const { show, hide, isPinned } = useToolbarStore()
  const [themeVersion, setThemeVersion] = useState(0)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    return storage.watch<string>("local:theme", function handleThemeChange(newTheme) {
      if (!newTheme) return
      localStorage.setItem("promptpen-theme", newTheme)
      applyThemeToShadowRoot(newTheme)
      setThemeVersion((v) => v + 1)
    })
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

  return (
    <>
      <ContextualToolbar key={themeVersion} />
    </>
  )
}

async function preloadTheme() {
  try {
    const theme = await storage.getItem<string>("local:theme")
    if (theme) {
      localStorage.setItem("promptpen-theme", theme)
    }
  } catch {}
}

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  async main(ctx) {
    const hostname = getHostnameFromUrl(window.location.href)
    if (hostname && await isWebsiteExcluded(hostname)) {
      return
    }

    await preloadTheme()

    const container = document.createElement("div")
    container.id = "promptpen-root"
    document.body.append(container)

    const shadowRoot = container.attachShadow({ mode: "closed" })
    const styleEl = document.createElement("style")
    styleEl.textContent = tailwindStyles
    shadowRoot.append(styleEl)

    const rootEl = document.createElement("div")
    rootEl.id = "pp:root"
    shadowRoot.append(rootEl)
    shadowRootEl = rootEl

    applyThemeToShadowRoot(localStorage.getItem("promptpen-theme") ?? "system")

    const root = createRoot(rootEl)
    root.render(<ContentScript />)

    ctx.onInvalidated(() => {
      root.unmount()
      container.remove()
    })
  },
})
