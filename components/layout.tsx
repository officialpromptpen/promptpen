import type { ReactNode } from "react"
import { ThemeProvider } from "@/features/theme/theme-provider"

interface LayoutProps {
  children: ReactNode
  variant?: "panel" | "inline"
}

export function Layout({ children, variant = "panel" }: LayoutProps) {
  if (variant === "inline") {
    return <ThemeProvider>{children}</ThemeProvider>
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen w-90 flex-col bg-background text-foreground">
        {children}
      </div>
    </ThemeProvider>
  )
}
