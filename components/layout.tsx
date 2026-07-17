import type { ReactNode } from "react"
import type { LayoutProps } from "@/types"

export function Layout({ children, variant = "panel" }: LayoutProps) {
  if (variant === "inline") {
    return <>{children}</>
  }

  return (
    <div className="pp:flex pp:min-h-screen pp:w-90 pp:flex-col pp:bg-background pp:text-foreground">
      {children}
    </div>
  )
}
