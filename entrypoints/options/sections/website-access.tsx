import { Globe, GlobeLock, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import {
  getHostnameFromInput,
  getWebsiteAccessState,
  setWebsiteEnabled,
} from "@/features/storage/website-access"
import type { OptionsState } from "../hooks/use-options-state"

function parseHostnames(input: string): string[] {
  return input
    .split(/[,;]/)
    .map((part) => getHostnameFromInput(part.trim()))
    .filter(Boolean) as string[]
}

function getEnabledHostnames(accessState: { websiteRules: { enabled: boolean; hostname: string }[] }) {
  const result: string[] = []
  for (const rule of accessState.websiteRules) {
    if (rule.enabled) result.push(rule.hostname)
  }
  return result
}

export function WebsiteAccessSection(_state: OptionsState) {
  const [websiteInput, setWebsiteInput] = useState("")
  const [enabledWebsites, setEnabledWebsites] = useState<string[]>([])
  const [deleteConfirmWebsite, setDeleteConfirmWebsite] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const accessState = await getWebsiteAccessState()
      if (!mounted) return
      setEnabledWebsites(getEnabledHostnames(accessState))
    }

    void load()
    return () => {
      mounted = false
    }
  }, [])

  async function refresh() {
    const accessState = await getWebsiteAccessState()
    setEnabledWebsites(getEnabledHostnames(accessState))
  }

  async function addWebsites() {
    const hostnames = parseHostnames(websiteInput)
    if (hostnames.length === 0) return

    await Promise.all(hostnames.map((hostname) => setWebsiteEnabled(hostname, true)))

    setWebsiteInput("")
    setDeleteConfirmWebsite(null)
    await refresh()
  }

  async function handleRemoveWebsite(hostname: string) {
    await setWebsiteEnabled(hostname, false)
    setDeleteConfirmWebsite(null)
    await refresh()
  }

  const parsedPreview = websiteInput.trim() ? parseHostnames(websiteInput) : []

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Website Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage which websites PromptPen can access. Use the toggle in the popup to quickly enable
          or disable the current page.
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="add-websites">
            Add websites
          </label>
          <p className="text-xs text-muted-foreground">
            Enter one or more domains. Separate multiple entries with a comma or semicolon.
          </p>
          <div className="flex items-center gap-2">
            <input
              id="add-websites"
              value={websiteInput}
              onChange={(event) => setWebsiteInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void addWebsites()
                }
              }}
              className="h-9 w-full max-w-md rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground/60"
              placeholder="e.g. medium.com, github.com, docs.google.com"
            />
            <button
              type="button"
              onClick={() => void addWebsites()}
              disabled={!websiteInput.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span className="sr-only">Add websites</span>
            </button>
          </div>
          {parsedPreview.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {parsedPreview.length} websites will be added: {parsedPreview.join(", ")}
            </p>
          )}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">
          Enabled websites
          {enabledWebsites.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({enabledWebsites.length})
            </span>
          )}
        </h2>

        {enabledWebsites.length > 0 ? (
          <div className="space-y-1.5">
            {enabledWebsites.map((hostname) => {
              const isPendingDelete = deleteConfirmWebsite === hostname
              return (
                <div
                  key={hostname}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GlobeLock
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-foreground">{hostname}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isPendingDelete ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleRemoveWebsite(hostname)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmWebsite(null)}
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmWebsite(hostname)}
                        className="flex size-6 items-center justify-center rounded-md text-muted-foreground/60 hover:bg-accent hover:text-destructive"
                      >
                        <X className="size-4" aria-hidden="true" />
                        <span className="sr-only">Remove {hostname}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-card/50 px-4 py-8 text-center">
            <Globe className="mx-auto size-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="mt-2 text-sm text-muted-foreground">No websites added yet.</p>
            <p className="text-xs text-muted-foreground/60">
              Add domains above to control where PromptPen can assist you.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
