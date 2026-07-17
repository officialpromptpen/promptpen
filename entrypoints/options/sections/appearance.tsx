import { Separator } from "@/components/ui/separator"
import { ThemeSelector } from "@/features/theme/theme-selector"
import type { OptionsState } from "@/types"

export function AppearanceSection(_state: OptionsState) {
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
        <ThemeSelector />
      </section>
    </div>
  )
}
