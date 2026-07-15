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
      <div className="pp:flex pp:min-h-screen pp:w-90 pp:flex-col pp:bg-background pp:text-foreground">
        {children}
      </div>
    </ThemeProvider>
  )
}
