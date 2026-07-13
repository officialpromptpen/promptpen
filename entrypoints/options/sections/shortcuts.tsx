import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { OptionsState } from "../hooks/use-options-state"
import { defaultShortcuts, shortcutRows } from "@/constants/options"

export function ShortcutsSection(state: OptionsState) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Keyboard Shortcuts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize keyboard shortcuts for all PromptPen actions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => state.setShortcuts(defaultShortcuts)}
          className="gap-1.5"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        {shortcutRows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.category}</p>
            </div>
            <input
              aria-label={`Shortcut for ${row.label}`}
              value={state.shortcuts[row.id] ?? ""}
              onChange={(event) => state.updateShortcut(row.id, event.target.value)}
              className="h-8 w-28 rounded-md border bg-background px-2 text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
