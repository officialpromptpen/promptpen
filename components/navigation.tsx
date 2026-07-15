import { browser } from "wxt/browser"
import { LayoutDashboard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

function openOptions() {
  browser.runtime.openOptionsPage()
}

const links = [
  { label: "Dashboard", icon: LayoutDashboard, action: openOptions },
  { label: "Settings", icon: Settings, action: openOptions },
] as const

export function Navigation() {
  return (
    <nav
      className="pp:flex pp:items-center pp:justify-around pp:border-t pp:bg-background pp:p-2"
      aria-label="Main navigation"
    >
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Button
            key={link.label}
            variant="ghost"
            size="sm"
            className="pp:flex pp:flex-col pp:gap-0.5 pp:h-auto pp:py-2 pp:px-4 pp:text-xs pp:text-muted-foreground hover:pp:text-foreground"
            aria-label={link.label}
            onClick={link.action}
          >
            <Icon className="pp:size-4" />
            <span>{link.label}</span>
          </Button>
        )
      })}
    </nav>
  )
}
