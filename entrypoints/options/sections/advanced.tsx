import { Download, RotateCcw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { OptionsState } from "../hooks/use-options-state"

export function AdvancedSection(state: OptionsState) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Advanced</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Advanced settings and utilities for PromptPen.
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Data Management</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={state.exportSettings} className="gap-2">
            <Download className="h-4 w-4" />
            Export Settings
          </Button>
          <Button variant="outline" disabled className="gap-2">
            <Upload className="h-4 w-4" />
            Import Settings
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-destructive">Danger Zone</h2>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={() => {
            if (confirm("Reset all settings and local options data?")) {
              state.resetAllData()
            }
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset All Settings
        </Button>
      </section>
    </div>
  )
}
