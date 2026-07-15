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
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Website Access</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Manage which websites PromptPen can access. Use the toggle in the popup to quickly enable
          or disable the current page.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-4">
        <div className="pp:space-y-1.5">
          <label className="pp:text-sm pp:font-medium" htmlFor="add-websites">
            Add websites
          </label>
          <p className="pp:text-xs pp:text-muted-foreground">
            Enter one or more domains. Separate multiple entries with a comma or semicolon.
          </p>
          <div className="pp:flex pp:items-center pp:gap-2">
            <input
              id="add-websites"
              value={websiteInput}
              onChange={(event) => setWebsiteInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void addWebsites()
                }
              }}
              className="pp:h-9 pp:w-full pp:max-w-md pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm placeholder:pp:text-muted-foreground/60"
              placeholder="e.g. medium.com, github.com, docs.google.com"
            />
            <button
              type="button"
              onClick={() => void addWebsites()}
              disabled={!websiteInput.trim()}
              className="pp:flex pp:h-9 pp:w-9 pp:shrink-0 pp:items-center pp:justify-center pp:rounded-md pp:border pp:bg-background pp:text-muted-foreground hover:pp:bg-accent hover:pp:text-accent-foreground disabled:pp:opacity-40"
            >
              <Plus className="pp:size-4" aria-hidden="true" />
              <span className="sr-only">Add websites</span>
            </button>
          </div>
          {parsedPreview.length > 1 && (
            <p className="pp:text-xs pp:text-muted-foreground">
              {parsedPreview.length} websites will be added: {parsedPreview.join(", ")}
            </p>
          )}
        </div>
      </section>

      <Separator />

      <section className="pp:space-y-4">
        <h2 className="pp:text-lg pp:font-medium">
          Enabled websites
          {enabledWebsites.length > 0 && (
            <span className="pp:ml-2 pp:text-sm pp:font-normal pp:text-muted-foreground">
              ({enabledWebsites.length})
            </span>
          )}
        </h2>

        {enabledWebsites.length > 0 ? (
          <div className="pp:space-y-1.5">
            {enabledWebsites.map((hostname) => {
              const isPendingDelete = deleteConfirmWebsite === hostname
              return (
                <div
                  key={hostname}
                  className="pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:bg-card pp:px-4 pp:py-2.5"
                >
                  <div className="pp:flex pp:items-center pp:gap-2.5 pp:min-w-0">
                    <GlobeLock
                      className="pp:size-4 pp:shrink-0 pp:text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="pp:text-sm pp:text-foreground">{hostname}</span>
                  </div>

                  <div className="pp:flex pp:items-center pp:gap-2 pp:shrink-0 pp:ml-2">
                    {isPendingDelete ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleRemoveWebsite(hostname)}
                          className="pp:rounded-md pp:px-2 pp:py-1 pp:text-xs pp:font-medium pp:text-destructive hover:pp:bg-destructive/10"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmWebsite(null)}
                          className="pp:rounded-md pp:px-2 pp:py-1 pp:text-xs pp:text-muted-foreground hover:pp:bg-accent"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmWebsite(hostname)}
                        className="pp:flex pp:size-6 pp:items-center pp:justify-center pp:rounded-md pp:text-muted-foreground/60 hover:pp:bg-accent hover:pp:text-destructive"
                      >
                        <X className="pp:size-4" aria-hidden="true" />
                        <span className="sr-only">Remove {hostname}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="pp:rounded-lg pp:border pp:border-dashed pp:bg-card/50 pp:px-4 pp:py-8 pp:text-center">
            <Globe className="pp:mx-auto pp:size-8 pp:text-muted-foreground/40" aria-hidden="true" />
            <p className="pp:mt-2 pp:text-sm pp:text-muted-foreground">No websites added yet.</p>
            <p className="pp:text-xs pp:text-muted-foreground/60">
              Add domains above to control where PromptPen can assist you.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
