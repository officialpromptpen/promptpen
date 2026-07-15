import { Separator } from "@/components/ui/separator"
import type { OptionsState } from "../hooks/use-options-state"

export function PrivacySection(_state: OptionsState) {
  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Privacy</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Understand how PromptPen handles your data.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-3">
        <h2 className="pp:text-lg pp:font-medium">What PromptPen Sends</h2>
        <div className="pp:rounded-lg pp:border pp:bg-card pp:p-4">
          <p className="pp:text-sm pp:font-medium">Selected Text</p>
          <p className="pp:text-xs pp:text-muted-foreground">
            Only selected text is sent when you trigger an action.
          </p>
        </div>
        <div className="pp:rounded-lg pp:border pp:bg-card pp:p-4">
          <p className="pp:text-sm pp:font-medium">Writing Action & Prompt</p>
          <p className="pp:text-xs pp:text-muted-foreground">
            Action type and your custom prompt instructions.
          </p>
        </div>
        <div className="pp:rounded-lg pp:border pp:bg-card pp:p-4">
          <p className="pp:text-sm pp:font-medium">Model & Provider Configuration</p>
          <p className="pp:text-xs pp:text-muted-foreground">
            Configured model and provider selection for request routing.
          </p>
        </div>
      </section>

      <Separator />

      <section className="pp:space-y-3">
        <h2 className="pp:text-lg pp:font-medium">What PromptPen Does NOT Collect</h2>
        <div className="pp:rounded-lg pp:border pp:bg-card pp:p-4">
          <p className="pp:text-sm pp:font-medium">No Telemetry or Analytics</p>
          <p className="pp:text-xs pp:text-muted-foreground">
            No usage analytics or telemetry are collected.
          </p>
        </div>
        <div className="pp:rounded-lg pp:border pp:bg-card pp:p-4">
          <p className="pp:text-sm pp:font-medium">No Personal Information</p>
          <p className="pp:text-xs pp:text-muted-foreground">
            Names, emails, and personal details are not collected.
          </p>
        </div>
        <div className="pp:rounded-lg pp:border pp:bg-card pp:p-4">
          <p className="pp:text-sm pp:font-medium">No Page Harvesting</p>
          <p className="pp:text-xs pp:text-muted-foreground">
            Page content is only processed when you explicitly request it.
          </p>
        </div>
      </section>
    </div>
  )
}
