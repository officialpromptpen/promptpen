import type { ReactNode } from "react"
import { useEffect } from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: string
}

function ThemeSync() {
  const { theme } = useTheme()

  useEffect(() => {
    try {
      chrome.storage.local.set({ theme })
    } catch {}
  }, [theme])

  return null
}

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey="promptpen-theme"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  )
}
