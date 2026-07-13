import { Separator } from "@/components/ui/separator"
import type { OptionsState } from "../hooks/use-options-state"

export function PrivacySection(_state: OptionsState) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Understand how PromptPen handles your data.
        </p>
      </div>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">What PromptPen Sends</h2>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">Selected Text</p>
          <p className="text-xs text-muted-foreground">
            Only selected text is sent when you trigger an action.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">Writing Action & Prompt</p>
          <p className="text-xs text-muted-foreground">
            Action type and your custom prompt instructions.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">Model & Provider Configuration</p>
          <p className="text-xs text-muted-foreground">
            Configured model and provider selection for request routing.
          </p>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">What PromptPen Does NOT Collect</h2>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">No Telemetry or Analytics</p>
          <p className="text-xs text-muted-foreground">
            No usage analytics or telemetry are collected.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">No Personal Information</p>
          <p className="text-xs text-muted-foreground">
            Names, emails, and personal details are not collected.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">No Page Harvesting</p>
          <p className="text-xs text-muted-foreground">
            Page content is only processed when you explicitly request it.
          </p>
        </div>
      </section>
    </div>
  )
}
