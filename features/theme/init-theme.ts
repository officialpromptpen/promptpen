import { storage } from "@wxt-dev/storage"

type Theme = "light" | "dark" | "system"

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export async function initTheme() {
  try {
    const stored = await storage.getItem<Theme>("sync:promptpen-theme")
    const theme = stored ?? "system"
    const resolved = theme === "system" ? getSystemTheme() : theme
    document.documentElement.classList.toggle("dark", resolved === "dark")
  } catch {
    document.documentElement.classList.toggle("dark", getSystemTheme() === "dark")
  }
}
