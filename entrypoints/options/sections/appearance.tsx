import { Check, Monitor, Moon, Sun } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { OptionsState } from "../hooks/use-options-state"
import { Button } from "@/components/ui/button"

const themeButtons = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
]

export function AppearanceSection(_state: OptionsState) {
  const selected = true

  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Appearance</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Customize the look and feel of PromptPen.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-4">
        <h2 className="pp:text-lg pp:font-medium">Theme</h2>
        <div className="pp:grid pp:grid-cols-3 pp:h-20 pp:gap-3">
          {themeButtons.map((themeOption) => {

            return (
              <Button
                key={themeOption.id}
                className={cn(
                  "pp:h-12 pp:w-full pp:justify-start pp:gap-3 pp:px-4 pp:transition-all pp:duration-200",
                  selected
                    ? "pp:bg-primary pp:text-primary-foreground pp:shadow-sm hover:pp:bg-primary/90"
                    : "pp:bg-background pp:text-muted-foreground hover:pp:bg-accent hover:pp:text-accent-foreground",
                )}
                variant={selected ? "default" : "outline"}
                
              >
                <Sun className="pp:h-5 pp:w-5 pp:shrink-0" />
                <span className="pp:font-medium pp:text-sm pp:flex-1 pp:text-left">
                  {themeOption.label}
                </span>
                {selected && (
                  <Check className="pp:h-4 pp:w-4 pp:animate-in pp:fade-in pp:zoom-in-95 pp:duration-100" />
                )}
              </Button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
