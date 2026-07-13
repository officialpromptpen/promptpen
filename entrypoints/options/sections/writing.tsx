import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { OptionsState } from "../hooks/use-options-state"
import { quickActions, writingStyles } from "@/constants/options"

export function WritingSection(state: OptionsState) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Writing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure writing defaults, quick actions, and custom prompts.
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Default Writing Style</h2>
        <label className="space-y-1.5 block">
          <span className="text-sm font-medium">Style</span>
          <select
            value={state.settings.defaultWritingStyle}
            onChange={(event) =>
              state.setSettings((previous) => ({
                ...previous,
                defaultWritingStyle: event.target.value,
              }))
            }
            className="h-9 w-56 rounded-md border bg-background px-3 text-sm"
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

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">
          Toggle which actions appear in the toolbar and popup quick action bar.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => {
            const checked = state.settings.quickActions.includes(action.id)
            return (
              <label
                key={action.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  checked ? "border-primary bg-primary/5" : "hover:bg-accent/30",
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

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Custom Prompts</h2>

        {state.customPrompts.length > 0 && (
          <div className="space-y-2">
            {state.customPrompts.map((prompt) => (
              <div key={prompt.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{prompt.title}</p>
                  <button
                    type="button"
                    onClick={() => state.removeCustomPrompt(prompt.id)}
                    className="text-sm text-destructive"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{prompt.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">Add New Prompt</p>
          <input
            value={state.promptTitle}
            onChange={(event) => state.setPromptTitle(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            placeholder="My Custom Prompt"
          />
          <textarea
            value={state.promptContent}
            onChange={(event) => state.setPromptContent(event.target.value)}
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Write your prompt here. Use {{text}} for selected text."
          />
          <select
            value={state.promptCategory}
            onChange={(event) => state.setPromptCategory(event.target.value)}
            className="h-9 w-44 rounded-md border bg-background px-3 text-sm"
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
            <Plus className="mr-1.5 h-4 w-4" />
            Add Prompt
          </Button>
        </div>
      </section>
    </div>
  )
}
