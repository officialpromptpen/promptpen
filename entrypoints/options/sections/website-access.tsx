import { Globe, GlobeLock, MinusCircle, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import {
  getHostnameFromInput,
  getWebsiteAccessState,
  setWebsiteEnabled,
  setWebsiteExcluded,
} from "@/features/storage/website-access"
import type { OptionsState, AddFormProps, WebsiteListSectionProps, WebsiteAccessStateParam } from "@/types"
import { Button } from "@/components/ui/button"

function parseHostnames(input: string): string[] {
  return input
    .split(/[,;]/)
    .map((part) => getHostnameFromInput(part.trim()))
    .filter(Boolean) as string[]
}

function getEnabledHostnames(accessState: WebsiteAccessStateParam) {
  const result: string[] = []
  for (const rule of accessState.websiteRules) {
    if (rule.enabled) result.push(rule.hostname)
  }
  return result
}

function AddForm({
  id,
  value,
  onChange,
  onAdd,
  placeholder,
  label,
  description,
  icon,
  preview,
}: AddFormProps) {
  return (
    <section className="pp:space-y-4">
      <div className="pp:space-y-1.5">
        <label className="pp:text-sm pp:font-medium" htmlFor={id}>
          {label}
        </label>
        <p className="pp:text-xs pp:text-muted-foreground">{description}</p>
        <div className="pp:flex pp:items-center pp:gap-2">
          <input
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void onAdd()
            }}
            className="pp:h-9 pp:w-full pp:max-w-md pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm placeholder:pp:text-muted-foreground/60"
            placeholder={placeholder}
          />
          <Button
            onClick={() => void onAdd()}
            disabled={!value.trim()}
            aria-label={label}
            variant="outline"
            className="pp:rounded-xs"
            title={label}
          >
            {icon}
          </Button>
        </div>
        {preview.length > 1 && (
          <p className="pp:text-xs pp:text-muted-foreground">
            {preview.length} websites will be added: {preview.join(", ")}
          </p>
        )}
      </div>
    </section>
  )
}

function WebsiteListSection({
  title,
  items,
  deleteConfirm,
  onRemove,
  onDeleteConfirm,
  onCancelDelete,
  icon,
  emptyTitle,
  emptyDescription,
}: WebsiteListSectionProps) {
  return (
    <section className="pp:space-y-4">
      <h2 className="pp:text-lg pp:font-medium">
        {title}
        {items.length > 0 && (
          <span className="pp:ml-2 pp:text-sm pp:font-normal pp:text-muted-foreground">
            ({items.length})
          </span>
        )}
      </h2>

      {items.length > 0 ? (
        <div className="pp:space-y-1.5">
          {items.map((hostname) => {
            const isPendingDelete = deleteConfirm === hostname
            return (
              <div
                key={hostname}
                className="pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:bg-card pp:px-4 pp:py-2.5"
              >
                <div className="pp:flex pp:items-center pp:gap-2.5 pp:min-w-0">
                  <span className="pp:size-4 pp:shrink-0 pp:text-muted-foreground">{icon}</span>
                  <span className="pp:text-sm pp:text-foreground">{hostname}</span>
                </div>

                <div className="pp:flex pp:items-center pp:gap-2 pp:shrink-0 pp:ml-2">
                  {isPendingDelete ? (
                    <>
                      <Button
                        onClick={() => void onRemove(hostname)}
                        aria-label={`Remove ${hostname}`}
                        title={`Remove ${hostname}`}
                        variant="destructive"
                        className="pp:rounded-xs"
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={onCancelDelete}
                        variant="outline"
                        aria-label={`Cancel remove ${hostname}`}
                        title={`Cancel remove ${hostname}`}
                        className="pp:rounded-xs"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => onDeleteConfirm(hostname)}
                      variant="ghost"
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
          <span className="pp:mx-auto pp:size-8 pp:text-muted-foreground/40">{icon}</span>
          <p className="pp:mt-2 pp:text-sm pp:text-muted-foreground">{emptyTitle}</p>
          <p className="pp:text-xs pp:text-muted-foreground/60">{emptyDescription}</p>
        </div>
      )}
    </section>
  )
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

      <AddForm
        id="add-websites"
        value={websiteInput}
        onChange={setWebsiteInput}
        onAdd={addWebsites}
        placeholder="e.g. medium.com, github.com, docs.google.com"
        label="Allow websites"
        description="Add domains where PromptPen should run. Separate multiple entries with a comma or semicolon."
        icon={<Plus className="pp:size-4" aria-hidden="true" />}
        preview={parsedPreview}
      />

      <Separator />

      <WebsiteListSection
        title="Allowed websites"
        items={enabledWebsites}
        deleteConfirm={deleteConfirmWebsite}
        onRemove={handleRemoveWebsite}
        onDeleteConfirm={setDeleteConfirmWebsite}
        onCancelDelete={() => setDeleteConfirmWebsite(null)}
        icon={<GlobeLock className="pp:size-4" />}
        emptyTitle="No allowed websites."
        emptyDescription="Add domains above to allow PromptPen on specific sites."
      />

      <Separator />

      <AddForm
        id="exclude-websites"
        value={excludeInput}
        onChange={setExcludeInput}
        onAdd={addExcludedWebsites}
        placeholder="e.g. reddit.com, x.com, youtube.com"
        label="Exclude websites"
        description="Add domains where PromptPen should never run. The toolbar will not appear on excluded sites."
        icon={<MinusCircle className="pp:size-4" aria-hidden="true" />}
        preview={parsedExcludePreview}
      />

      <Separator />

      <WebsiteListSection
        title="Excluded websites"
        items={excludedWebsites}
        deleteConfirm={deleteConfirmExcluded}
        onRemove={handleRemoveExcluded}
        onDeleteConfirm={setDeleteConfirmExcluded}
        onCancelDelete={() => setDeleteConfirmExcluded(null)}
        icon={<MinusCircle className="pp:size-4 pp:text-destructive/60" />}
        emptyTitle="No excluded websites."
        emptyDescription="Add domains above to prevent PromptPen from running on specific sites."
      />
    </div>
  )
}
