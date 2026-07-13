import { Check, Monitor, Moon, Sun } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { OptionsState } from "../hooks/use-options-state"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

const themeButtons = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
]

export function AppearanceSection(_state: OptionsState) {
  const { setTheme, theme } = useTheme()
  const current = theme ?? "system"

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appearance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize the look and feel of PromptPen.
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Theme</h2>
        <div className="grid grid-cols-3 h-20 gap-3">
          {themeButtons.map((themeOption) => {
            const Icon = themeOption.icon
            const selected = current === themeOption.id

            return (
              <Button
                key={themeOption.id}
                className={cn(
                  "h-12 w-full justify-start gap-3 px-4 transition-all duration-200",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                variant={selected ? "default" : "outline"}
                onClick={() => {
                  setTheme(themeOption.id)
                }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="font-medium text-sm flex-1 text-left">
                  {themeOption.label}
                </span>
                {selected && (
                  <Check className="h-4 w-4 animate-in fade-in zoom-in-95 duration-100" />
                )}
              </Button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
