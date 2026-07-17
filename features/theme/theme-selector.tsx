import { Check, Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Theme } from "@/types"
import { useTheme } from "./hooks/use-theme"

const options: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="pp:grid pp:grid-cols-3 pp:gap-3">
      {options.map((option) => {
        const Icon = option.icon
        const selected = theme === option.id

        return (
          <Button
            key={option.id}
            variant={selected ? "default" : "outline"}
            className={cn(
              "pp:h-12 pp:w-full pp:justify-start pp:gap-3 pp:px-4 pp:transition-all pp:duration-200",
              selected
                ? "pp:bg-primary pp:text-primary-foreground pp:shadow-sm hover:pp:bg-primary/90"
                : "pp:bg-background pp:text-muted-foreground hover:pp:bg-accent hover:pp:text-accent-foreground",
            )}
            onClick={() => setTheme(option.id)}
          >
            <Icon className="pp:h-5 pp:w-5 pp:shrink-0" />
            <span className="pp:flex-1 pp:text-left pp:text-sm pp:font-medium">{option.label}</span>
            {selected && (
              <Check className="pp:h-4 pp:w-4 pp:animate-in pp:fade-in pp:zoom-in-95 pp:duration-100" />
            )}
          </Button>
        )
      })}
    </div>
  )
}
