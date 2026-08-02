import { GlobeLock, MinusCircle, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getHostnameFromInput,
  getWebsiteAccessState,
  setWebsiteEnabled,
  setWebsiteExcluded,
} from "@/features/storage/website-access";
import type {
  AddFormProps,
  OptionsState,
  WebsiteAccessStateParam,
  WebsiteListSectionProps,
} from "@/types";

const HOSTNAME_SEPARATOR_RE = /[,;]/;

function parseHostnames(input: string): string[] {
  return input
    .split(HOSTNAME_SEPARATOR_RE)
    .map((part) => getHostnameFromInput(part.trim()))
    .filter(Boolean) as string[];
}

function getEnabledHostnames(accessState: WebsiteAccessStateParam) {
  const result: string[] = [];
  for (const rule of accessState.websiteRules) {
    if (rule.enabled) {
      result.push(rule.hostname);
    }
  }
  return result;
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
        <label className="pp:font-medium pp:text-sm" htmlFor={id}>
          {label}
        </label>
        <p className="pp:text-muted-foreground pp:text-xs">{description}</p>
        <div className="pp:flex pp:items-center pp:gap-2">
          <input
            className="pp:h-9 pp:w-full pp:max-w-md pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm placeholder:pp:text-muted-foreground/60"
            id={id}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void onAdd();
              }
            }}
            placeholder={placeholder}
            value={value}
          />
          <Button
            aria-label={label}
            className="pp:rounded-xs"
            disabled={!value.trim()}
            onClick={() => void onAdd()}
            title={label}
            variant="outline"
          >
            {icon}
          </Button>
        </div>
        {preview.length > 1 && (
          <p className="pp:text-muted-foreground pp:text-xs">
            {preview.length} websites will be added: {preview.join(", ")}
          </p>
        )}
      </div>
    </section>
  );
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
      <h2 className="pp:font-medium pp:text-lg">
        {title}
        {items.length > 0 && (
          <span className="pp:ml-2 pp:font-normal pp:text-muted-foreground pp:text-sm">
            ({items.length})
          </span>
        )}
      </h2>

      {items.length > 0 ? (
        <div className="pp:space-y-1.5">
          {items.map((hostname) => {
            const isPendingDelete = deleteConfirm === hostname;
            return (
              <div
                className="pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:bg-card pp:px-4 pp:py-2.5"
                key={hostname}
              >
                <div className="pp:flex pp:min-w-0 pp:items-center pp:gap-2.5">
                  <span className="pp:size-4 pp:shrink-0 pp:text-muted-foreground">
                    {icon}
                  </span>
                  <span className="pp:text-foreground pp:text-sm">
                    {hostname}
                  </span>
                </div>

                <div className="pp:ml-2 pp:flex pp:shrink-0 pp:items-center pp:gap-2">
                  {isPendingDelete ? (
                    <>
                      <Button
                        aria-label={`Remove ${hostname}`}
                        className="pp:rounded-xs"
                        onClick={() => void onRemove(hostname)}
                        title={`Remove ${hostname}`}
                        variant="destructive"
                      >
                        Remove
                      </Button>
                      <Button
                        aria-label={`Cancel remove ${hostname}`}
                        className="pp:rounded-xs"
                        onClick={onCancelDelete}
                        title={`Cancel remove ${hostname}`}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      aria-label={`Remove ${hostname}`}
                      className="pp:flex pp:size-6 pp:items-center pp:justify-center pp:rounded-md pp:text-muted-foreground/60 hover:pp:bg-accent hover:pp:text-destructive"
                      onClick={() => onDeleteConfirm(hostname)}
                      title={`Remove ${hostname}`}
                      variant="ghost"
                    >
                      <X aria-hidden="true" className="pp:size-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pp:rounded-lg pp:border pp:border-dashed pp:bg-card/50 pp:px-4 pp:py-8 pp:text-center">
          <span className="pp:mx-auto pp:size-8 pp:text-muted-foreground/40">
            {icon}
          </span>
          <p className="pp:mt-2 pp:text-muted-foreground pp:text-sm">
            {emptyTitle}
          </p>
          <p className="pp:text-muted-foreground/60 pp:text-xs">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}

export function WebsiteAccessSection(_state: OptionsState) {
  const [websiteInput, setWebsiteInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [enabledWebsites, setEnabledWebsites] = useState<string[]>([]);
  const [excludedWebsites, setExcludedWebsites] = useState<string[]>([]);
  const [deleteConfirmWebsite, setDeleteConfirmWebsite] = useState<
    string | null
  >(null);
  const [deleteConfirmExcluded, setDeleteConfirmExcluded] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const accessState = await getWebsiteAccessState();
      if (!mounted) {
        return;
      }
      setEnabledWebsites(getEnabledHostnames(accessState));
      setExcludedWebsites(accessState.excludedHostnames);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function refresh() {
    const accessState = await getWebsiteAccessState();
    setEnabledWebsites(getEnabledHostnames(accessState));
    setExcludedWebsites(accessState.excludedHostnames);
  }

  async function addWebsites() {
    const hostnames = parseHostnames(websiteInput);
    if (hostnames.length === 0) {
      return;
    }

    await Promise.all(
      hostnames.map((hostname) => setWebsiteEnabled(hostname, true))
    );

    setWebsiteInput("");
    setDeleteConfirmWebsite(null);
    await refresh();
  }

  async function addExcludedWebsites() {
    const hostnames = parseHostnames(excludeInput);
    if (hostnames.length === 0) {
      return;
    }

    await Promise.all(
      hostnames.map((hostname) => setWebsiteExcluded(hostname, true))
    );

    setExcludeInput("");
    setDeleteConfirmExcluded(null);
    await refresh();
  }

  async function handleRemoveWebsite(hostname: string) {
    await setWebsiteEnabled(hostname, false);
    setDeleteConfirmWebsite(null);
    await refresh();
  }

  async function handleRemoveExcluded(hostname: string) {
    await setWebsiteExcluded(hostname, false);
    setDeleteConfirmExcluded(null);
    await refresh();
  }

  const parsedPreview = websiteInput.trim() ? parseHostnames(websiteInput) : [];
  const parsedExcludePreview = excludeInput.trim()
    ? parseHostnames(excludeInput)
    : [];

  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:font-semibold pp:text-2xl pp:tracking-tight">
          Website Access
        </h1>
        <p className="pp:mt-1 pp:text-muted-foreground pp:text-sm">
          PromptPen is disabled by default. Add sites below to allow the toolbar
          on specific domains. Excluded sites will never show the PromptPen
          toolbar regardless of the allow list.
        </p>
      </div>

      <Separator />

      <AddForm
        description="Add domains where PromptPen should run. Separate multiple entries with a comma or semicolon."
        icon={<Plus aria-hidden="true" className="pp:size-4" />}
        id="add-websites"
        label="Allow websites"
        onAdd={addWebsites}
        onChange={setWebsiteInput}
        placeholder="e.g. medium.com, github.com, docs.google.com"
        preview={parsedPreview}
        value={websiteInput}
      />

      <Separator />

      <WebsiteListSection
        deleteConfirm={deleteConfirmWebsite}
        emptyDescription="Add domains above to allow PromptPen on specific sites."
        emptyTitle="No allowed websites."
        icon={<GlobeLock className="pp:size-4" />}
        items={enabledWebsites}
        onCancelDelete={() => setDeleteConfirmWebsite(null)}
        onDeleteConfirm={setDeleteConfirmWebsite}
        onRemove={handleRemoveWebsite}
        title="Allowed websites"
      />

      <Separator />

      <AddForm
        description="Add domains where PromptPen should never run. The toolbar will not appear on excluded sites."
        icon={<MinusCircle aria-hidden="true" className="pp:size-4" />}
        id="exclude-websites"
        label="Exclude websites"
        onAdd={addExcludedWebsites}
        onChange={setExcludeInput}
        placeholder="e.g. reddit.com, x.com, youtube.com"
        preview={parsedExcludePreview}
        value={excludeInput}
      />

      <Separator />

      <WebsiteListSection
        deleteConfirm={deleteConfirmExcluded}
        emptyDescription="Add domains above to prevent PromptPen from running on specific sites."
        emptyTitle="No excluded websites."
        icon={<MinusCircle className="pp:size-4 pp:text-destructive/60" />}
        items={excludedWebsites}
        onCancelDelete={() => setDeleteConfirmExcluded(null)}
        onDeleteConfirm={setDeleteConfirmExcluded}
        onRemove={handleRemoveExcluded}
        title="Excluded websites"
      />
    </div>
  );
}
