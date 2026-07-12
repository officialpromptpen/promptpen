import { LayoutDashboard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

function openOptions() {
  chrome.runtime.openOptionsPage()
}

const links = [
  { label: "Dashboard", icon: LayoutDashboard, action: openOptions },
  { label: "Settings", icon: Settings, action: openOptions },
] as const

export function Navigation() {
  return (
    <nav
      className="flex items-center justify-around border-t bg-background p-2"
      aria-label="Main navigation"
    >
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Button
            key={link.label}
            variant="ghost"
            size="sm"
            className="flex flex-col gap-0.5 h-auto py-2 px-4 text-xs text-muted-foreground hover:text-foreground"
            aria-label={link.label}
            onClick={link.action}
          >
            <Icon className="size-4" />
            <span>{link.label}</span>
          </Button>
        )
      })}
    </nav>
  )
}
