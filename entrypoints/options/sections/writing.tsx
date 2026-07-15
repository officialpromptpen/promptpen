import { Plus } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { OptionsState } from "../hooks/use-options-state"
import { quickActions, writingStyles } from "@/constants/options"

export function WritingSection(state: OptionsState) {
  const quickActionsSet = useMemo(() => new Set(state.settings.quickActions), [state.settings.quickActions])
  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Writing</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Configure writing defaults, quick actions, and custom prompts.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-4">
        <h2 className="pp:text-lg pp:font-medium">Default Writing Style</h2>
        <label className="pp:space-y-1.5 pp:block">
          <span className="pp:text-sm pp:font-medium">Style</span>
          <select
            value={state.settings.defaultWritingStyle}
            onChange={(event) =>
              state.setSettings((previous) => ({
                ...previous,
                defaultWritingStyle: event.target.value,
              }))
            }
            className="pp:h-9 pp:w-56 pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
          >
            {writingStyles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <Separator />

      <section className="pp:space-y-4">
        <h2 className="pp:text-lg pp:font-medium">Quick Actions</h2>
        <p className="pp:text-sm pp:text-muted-foreground">
          Toggle which actions appear in the toolbar and popup quick action bar.
        </p>
        <div className="pp:grid pp:grid-cols-3 pp:gap-2">
          {quickActions.map((action) => {
            const checked = quickActionsSet.has(action.id)
            return (
              <label
                key={action.id}
                className={cn(
                  "pp:flex pp:cursor-pointer pp:items-center pp:gap-2 pp:rounded-lg pp:border pp:px-3 pp:py-2 pp:text-sm",
                  checked ? "pp:border-primary pp:bg-primary/5" : "hover:pp:bg-accent/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => state.toggleQuickAction(action.id)}
                />
                {action.label}
              </label>
            )
          })}
        </div>
      </section>

      <Separator />

      <section className="pp:space-y-4">
        <h2 className="pp:text-lg pp:font-medium">Custom Prompts</h2>

        {state.customPrompts.length > 0 && (
          <div className="pp:space-y-2">
            {state.customPrompts.map((prompt) => (
              <div key={prompt.id} className="pp:rounded-lg pp:border pp:bg-card pp:p-3">
                <div className="pp:flex pp:items-center pp:justify-between pp:gap-2">
                  <p className="pp:text-sm pp:font-medium">{prompt.title}</p>
                  <button
                    type="button"
                    onClick={() => state.removeCustomPrompt(prompt.id)}
                    className="pp:text-sm pp:text-destructive"
                  >
                    Remove
                  </button>
                </div>
                <p className="pp:mt-1 pp:text-xs pp:text-muted-foreground">{prompt.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="pp:space-y-3 pp:rounded-lg pp:border pp:bg-card pp:p-4">
          <p className="pp:text-sm pp:font-medium">Add New Prompt</p>
          <input
            value={state.promptTitle}
            onChange={(event) => state.setPromptTitle(event.target.value)}
            className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
            placeholder="My Custom Prompt"
          />
          <textarea
            value={state.promptContent}
            onChange={(event) => state.setPromptContent(event.target.value)}
            className="pp:min-h-24 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:py-2 pp:text-sm"
            placeholder="Write your prompt here. Use {{text}} for selected text."
          />
          <select
            aria-label="Prompt category"
            value={state.promptCategory}
            onChange={(event) => state.setPromptCategory(event.target.value)}
            className="pp:h-9 pp:w-44 pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
          >
            <option value="custom">Custom</option>
            <option value="grammar">Grammar</option>
            <option value="rewrite">Rewrite</option>
            <option value="summarize">Summarize</option>
          </select>
          <Button
            onClick={state.addCustomPrompt}
            disabled={!state.promptTitle.trim() || !state.promptContent.trim()}
          >
            <Plus className="pp:mr-1.5 pp:h-4 pp:w-4" />
            Add Prompt
          </Button>
        </div>
      </section>
    </div>
  )
}
