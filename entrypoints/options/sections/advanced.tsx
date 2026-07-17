import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { OptionsState } from "@/types"

export function AdvancedSection(state: OptionsState) {
  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Advanced</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Advanced settings and utilities for PromptPen.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-4">
        <h2 className="pp:text-lg pp:font-medium pp:text-destructive">Danger Zone</h2>
        <Button
          variant="destructive"
          className="pp:gap-2"
          onClick={() => {
            if (confirm("Reset all settings and local options data?")) {
              state.resetAllData()
            }
          }}
        >
          <RotateCcw className="pp:h-4 pp:w-4" />
          Reset All Settings
        </Button>
      </section>
    </div>
  )
}
