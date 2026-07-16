import { Globe, GlobeLock, MinusCircle, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import {
  getHostnameFromInput,
  getWebsiteAccessState,
  setWebsiteEnabled,
  setWebsiteExcluded,
} from "@/features/storage/website-access"
import type { OptionsState } from "../hooks/use-options-state"
import { Button } from "@/components/ui/button"

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
  const [excludeInput, setExcludeInput] = useState("")
  const [enabledWebsites, setEnabledWebsites] = useState<string[]>([])
  const [excludedWebsites, setExcludedWebsites] = useState<string[]>([])
  const [deleteConfirmWebsite, setDeleteConfirmWebsite] = useState<string | null>(null)
  const [deleteConfirmExcluded, setDeleteConfirmExcluded] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const accessState = await getWebsiteAccessState()
      if (!mounted) return
      setEnabledWebsites(getEnabledHostnames(accessState))
      setExcludedWebsites(accessState.excludedHostnames)
    }

    void load()
    return () => {
      mounted = false
    }
  }, [])

  async function refresh() {
    const accessState = await getWebsiteAccessState()
    setEnabledWebsites(getEnabledHostnames(accessState))
    setExcludedWebsites(accessState.excludedHostnames)
  }

  async function addWebsites() {
    const hostnames = parseHostnames(websiteInput)
    if (hostnames.length === 0) return

    await Promise.all(hostnames.map((hostname) => setWebsiteEnabled(hostname, true)))

    setWebsiteInput("")
    setDeleteConfirmWebsite(null)
    await refresh()
  }

  async function addExcludedWebsites() {
    const hostnames = parseHostnames(excludeInput)
    if (hostnames.length === 0) return

    await Promise.all(hostnames.map((hostname) => setWebsiteExcluded(hostname, true)))

    setExcludeInput("")
    setDeleteConfirmExcluded(null)
    await refresh()
  }

  async function handleRemoveWebsite(hostname: string) {
    await setWebsiteEnabled(hostname, false)
    setDeleteConfirmWebsite(null)
    await refresh()
  }

  async function handleRemoveExcluded(hostname: string) {
    await setWebsiteExcluded(hostname, false)
    setDeleteConfirmExcluded(null)
    await refresh()
  }

  const parsedPreview = websiteInput.trim() ? parseHostnames(websiteInput) : []
  const parsedExcludePreview = excludeInput.trim() ? parseHostnames(excludeInput) : []

  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Website Access</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Manage which websites PromptPen can access. Add sites to explicitly allow or exclude them.
          Excluded sites will never show the PromptPen toolbar.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-4">
        <div className="pp:space-y-1.5">
          <label className="pp:text-sm pp:font-medium" htmlFor="add-websites">
            Allow websites
          </label>
          <p className="pp:text-xs pp:text-muted-foreground">
            Add domains where PromptPen should run. Separate multiple entries with a comma or semicolon.
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
            <Button
              onClick={() => void addWebsites()}
              disabled={!websiteInput.trim()}
              aria-label="Add website"
              variant={"outline"}
              className="pp:rounded-xs"
              title="Add the website"
            >
              <Plus className="pp:size-4" aria-hidden="true" />
            </Button>
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
          Allowed websites
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
                        <Button
                          onClick={() => void handleRemoveWebsite(hostname)}
                          aria-label={`Remove ${hostname} website`}
                          title={`Remove ${hostname} website`}
                          variant={"destructive"}
                          className="pp:rounded-xs"
                        >
                          Remove
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirmWebsite(null)}
                          variant={"outline"}
                          aria-label={`Remove ${hostname} website`}
                          title={`Remove ${hostname} website`}
                          className="pp:rounded-xs"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setDeleteConfirmWebsite(hostname)}
                        variant={"ghost"}
                        aria-label={`Remove ${hostname}`}
                        title={`Remove ${hostname}`}  
                        className="pp:flex pp:size-6 pp:items-center pp:justify-center pp:rounded-md pp:text-muted-foreground/60 hover:pp:bg-accent hover:pp:text-destructive"
                      >
                        <X className="pp:size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="pp:rounded-lg pp:border pp:border-dashed pp:bg-card/50 pp:px-4 pp:py-8 pp:text-center">
            <Globe className="pp:mx-auto pp:size-8 pp:text-muted-foreground/40" aria-hidden="true" />
            <p className="pp:mt-2 pp:text-sm pp:text-muted-foreground">No allowed websites.</p>
            <p className="pp:text-xs pp:text-muted-foreground/60">
              Add domains above to allow PromptPen on specific sites.
            </p>
          </div>
        )}
      </section>

      <Separator />

      <section className="pp:space-y-4">
        <div className="pp:space-y-1.5">
          <label className="pp:text-sm pp:font-medium" htmlFor="exclude-websites">
            Exclude websites
          </label>
          <p className="pp:text-xs pp:text-muted-foreground">
            Add domains where PromptPen should never run. The toolbar will not appear on excluded sites.
          </p>
          <div className="pp:flex pp:items-center pp:gap-2">
            <input
              id="exclude-websites"
              value={excludeInput}
              onChange={(event) => setExcludeInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void addExcludedWebsites()
                }
              }}
              className="pp:h-9 pp:w-full pp:max-w-md pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm placeholder:pp:text-muted-foreground/60"
              placeholder="e.g. reddit.com, x.com, youtube.com"
            />
            <Button
              onClick={() => void addExcludedWebsites()}
              disabled={!excludeInput.trim()}
              aria-label="Exclude websites"
              variant={"outline"}
              title="Exclude the websites"
              className="pp:rounded-xs"
            >
              <MinusCircle className="pp:size-4" aria-hidden="true" />
              <span className="pp:sr-only">Exclude websites</span>
            </Button>
          </div>
          {parsedExcludePreview.length > 1 && (
            <p className="pp:text-xs pp:text-muted-foreground">
              {parsedExcludePreview.length} websites will be excluded: {parsedExcludePreview.join(", ")}
            </p>
          )}
        </div>
      </section>

      <Separator />

      <section className="pp:space-y-4">
        <h2 className="pp:text-lg pp:font-medium">
          Excluded websites
          {excludedWebsites.length > 0 && (
            <span className="pp:ml-2 pp:text-sm pp:font-normal pp:text-muted-foreground">
              ({excludedWebsites.length})
            </span>
          )}
        </h2>

        {excludedWebsites.length > 0 ? (
          <div className="pp:space-y-1.5">
            {excludedWebsites.map((hostname) => {
              const isPendingDelete = deleteConfirmExcluded === hostname
              return (
                <div
                  key={hostname}
                  className="pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:bg-card pp:px-4 pp:py-2.5"
                >
                  <div className="pp:flex pp:items-center pp:gap-2.5 pp:min-w-0">
                    <MinusCircle
                      className="pp:size-4 pp:shrink-0 pp:text-destructive/60"
                      aria-hidden="true"
                    />
                    <span className="pp:text-sm pp:text-foreground">{hostname}</span>
                  </div>

                  <div className="pp:flex pp:items-center pp:gap-2 pp:shrink-0 pp:ml-2">
                    {isPendingDelete ? (
                      <>
                        <Button
                          aria-label={`Remove ${hostname} website`}
                          title={`Remove ${hostname} website`}
                          variant={"destructive"}
                          className="pp:rounded-xs"
                          onClick={() => void handleRemoveExcluded(hostname)}
                        >
                          Remove
                        </Button>
                        <Button
                          aria-label={`Cancel ${hostname} website`}
                          title={`Cancel ${hostname} website`}
                          variant={"outline"}
                          onClick={() => setDeleteConfirmExcluded(null)}
                          className="pp:rounded-xs"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        aria-label={`Remove ${hostname} website`}
                        title={`Remove ${hostname} website`}
                        variant={"ghost"}
                        onClick={() => setDeleteConfirmExcluded(hostname)}
                        className="pp:flex pp:size-6 pp:items-center pp:justify-center pp:rounded-md pp:text-muted-foreground/60 hover:pp:bg-accent hover:pp:text-destructive"
                      >
                        <X className="pp:size-4" aria-hidden="true" />
                        <span className="pp:sr-only">Remove {hostname}</span>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="pp:rounded-lg pp:border pp:border-dashed pp:bg-card/50 pp:px-4 pp:py-8 pp:text-center">
            <Globe className="pp:mx-auto pp:size-8 pp:text-muted-foreground/40" aria-hidden="true" />
            <p className="pp:mt-2 pp:text-sm pp:text-muted-foreground">No excluded websites.</p>
            <p className="pp:text-xs pp:text-muted-foreground/60">
              Add domains above to prevent PromptPen from running on specific sites.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
