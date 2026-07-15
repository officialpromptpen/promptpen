import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { OptionsState } from "../hooks/use-options-state"
import { defaultShortcuts, shortcutRows } from "@/constants/options"

export function ShortcutsSection(state: OptionsState) {
  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div className="pp:flex pp:items-center pp:justify-between pp:gap-3">
        <div>
          <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Keyboard Shortcuts</h1>
          <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
            Customize keyboard shortcuts for all PromptPen actions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => state.setShortcuts(defaultShortcuts)}
          className="pp:gap-1.5"
        >
          <RotateCcw className="pp:h-4 pp:w-4" />
          Reset All
        </Button>
      </div>

      <Separator />

      <div className="pp:space-y-2">
        {shortcutRows.map((row) => (
          <div
            key={row.id}
            className="pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:bg-card pp:px-4 pp:py-3"
          >
            <div>
              <p className="pp:text-sm pp:font-medium">{row.label}</p>
              <p className="pp:text-xs pp:text-muted-foreground">{row.category}</p>
            </div>
            <input
              aria-label={`Shortcut for ${row.label}`}
              value={state.shortcuts[row.id] ?? ""}
              onChange={(event) => state.updateShortcut(row.id, event.target.value)}
              className="pp:h-8 pp:w-28 pp:rounded-md pp:border pp:bg-background pp:px-2 pp:text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
