import { useMemo, useState } from "react"
import { Plus, PencilLine, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { OptionsState } from "@/types"

export function CustomPromptsSection(state: OptionsState) {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const canSave = title.trim().length > 0 && prompt.trim().length > 0

  const sortedPrompts = useMemo(() => state.customPrompts, [state.customPrompts])

  async function handleSubmit() {
    if (!canSave) {
      return
    }

    await state.handleSaveCustomPrompt(title, prompt, editingPromptId ?? undefined)
    setTitle("")
    setPrompt("")
    setEditingPromptId(null)
  }

  function startEdit(promptId: string) {
    const existing = state.customPrompts.find((item) => item.id === promptId)
    if (!existing) return
    setTitle(existing.title)
    setPrompt(existing.prompt)
    setEditingPromptId(promptId)
    setDeleteConfirmId(null)
  }

  function resetForm() {
    setTitle("")
    setPrompt("")
    setEditingPromptId(null)
  }

  return (
    <div className="pp:mx-auto pp:max-w-3xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Custom Prompts</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Create reusable prompt templates. They will appear inside the toolbar under the Custom Prompt category.
        </p>
      </div>

      <Separator />

      <section className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
        <div className="pp:space-y-4">
          <div className="pp:grid pp:gap-4">
            <label className="pp:space-y-1.5">
              <span className="pp:text-sm pp:font-medium">Prompt title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
                placeholder="e.g. Friendly rewrite"
              />
            </label>

            <label className="pp:space-y-1.5">
              <span className="pp:text-sm pp:font-medium">Prompt text</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="pp:min-h-32 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:py-2 pp:text-sm"
                placeholder="Describe the transformation you want..."
              />
            </label>
          </div>

          <div className="pp:flex pp:flex-wrap pp:items-center pp:gap-3">
            <Button onClick={() => void handleSubmit()} disabled={!canSave} className="pp:gap-2">
              <Plus className="pp:h-4 pp:w-4" />
              {editingPromptId ? "Update prompt" : "Save prompt"}
            </Button>
            {editingPromptId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="pp:space-y-3">
        <div className="pp:flex pp:items-center pp:justify-between">
          <h2 className="pp:text-lg pp:font-semibold">Saved prompts</h2>
          <span className="pp:text-sm pp:text-muted-foreground">{sortedPrompts.length} prompts</span>
        </div>

        {sortedPrompts.length === 0 ? (
          <div className="pp:rounded-xl pp:border pp:border-dashed pp:bg-card/50 pp:px-4 pp:py-8 pp:text-center">
            <p className="pp:text-sm pp:text-muted-foreground">No custom prompts yet.</p>
          </div>
        ) : (
          <div className="pp:space-y-2">
            {sortedPrompts.map((item) => {
              const isPendingDelete = deleteConfirmId === item.id

              return (
                <div key={item.id} className="pp:rounded-lg pp:border pp:bg-card pp:px-4 pp:py-3">
                  <div className="pp:flex pp:items-start pp:justify-between pp:gap-3">
                    <div className="pp:min-w-0">
                      <h3 className="pp:text-sm pp:font-medium">{item.title}</h3>
                      <p className="pp:mt-1 pp:whitespace-pre-wrap pp:text-sm pp:text-muted-foreground">
                        {item.prompt}
                      </p>
                    </div>

                    <div className="pp:flex pp:items-center pp:gap-1.5 pp:shrink-0">
                      {isPendingDelete ? (
                        <>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              await state.handleDeleteCustomPrompt(item.id)
                              setDeleteConfirmId(null)
                            }}
                          >
                            Delete
                          </Button>
                          <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => startEdit(item.id)}>
                            <PencilLine className="pp:h-4 pp:w-4" />
                          </Button>
                          <Button variant="ghost" onClick={() => setDeleteConfirmId(item.id)}>
                            <Trash2 className="pp:h-4 pp:w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}