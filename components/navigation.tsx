import { LayoutDashboard, Settings } from "lucide-react";
import { browser } from "wxt/browser";
import { Button } from "@/components/ui/button";

function openOptions() {
  browser.runtime.openOptionsPage();
}

const links = [
  {
    action: openOptions,
    icon: LayoutDashboard,
    id: "pp-tour-home-btn",
    label: "Home",
  },
  {
    action: openOptions,
    icon: Settings,
    id: "pp-tour-dashboard-btn",
    label: "Dashboard",
  },
] as const;

export function Navigation() {
  return (
    <nav
      aria-label="Main navigation"
      className="pp:flex pp:items-center pp:justify-around pp:border-t pp:bg-background pp:p-2"
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            aria-label={link.label}
            className="pp:flex pp:h-auto pp:flex-col pp:gap-0.5 pp:px-4 pp:py-2 pp:text-muted-foreground pp:text-xs hover:pp:text-foreground"
            id={link.id}
            key={link.label}
            onClick={link.action}
            size="sm"
            variant="ghost"
          >
            <Icon className="pp:size-4" />
            <span>{link.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}
