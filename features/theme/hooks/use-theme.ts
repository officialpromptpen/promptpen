import { storage } from "@wxt-dev/storage"
import { useCallback, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

const THEME_KEY = "sync:promptpen-theme"

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme
}

function applyThemeToDocument(theme: Theme) {
  const resolved = resolveTheme(theme)
  document.documentElement.classList.toggle("dark", resolved === "dark")
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system")

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const stored = await storage.getItem<Theme>(THEME_KEY)
        if (!mounted) return
        const initial = stored ?? "system"
        setThemeState(initial)
        applyThemeToDocument(initial)
      } catch {
        if (mounted) {
          setThemeState("system")
          applyThemeToDocument("system")
        }
      }
    }

    void init()

    const unwatch = storage.watch<Theme>(THEME_KEY, (newTheme) => {
      if (!newTheme || !mounted) return
      setThemeState(newTheme)
      applyThemeToDocument(newTheme)
    })

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    function handleSystemChange() {
      setThemeState((current) => {
        if (current === "system") {
          applyThemeToDocument("system")
        }
        return current
      })
    }
    mediaQuery.addEventListener("change", handleSystemChange)

    return () => {
      mounted = false
      if (typeof unwatch === "function") unwatch()
      mediaQuery.removeEventListener("change", handleSystemChange)
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyThemeToDocument(next)
    void storage.setItem(THEME_KEY, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolveTheme(theme) === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return { theme, setTheme, toggleTheme, resolved: resolveTheme(theme) }
}
