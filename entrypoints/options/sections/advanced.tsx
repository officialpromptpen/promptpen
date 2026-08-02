import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OptionsState } from "@/types";

export function AdvancedSection(state: OptionsState) {
  return (
    <div className="pp:mx-auto pp:max-w-2xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:font-semibold pp:text-2xl pp:tracking-tight">
          Advanced
        </h1>
        <p className="pp:mt-1 pp:text-muted-foreground pp:text-sm">
          Advanced settings and utilities for PromptPen.
        </p>
      </div>

      <Separator />

      <section className="pp:space-y-4">
        <h2 className="pp:font-medium pp:text-destructive pp:text-lg">
          Danger Zone
        </h2>
        <Button
          className="pp:gap-2"
          onClick={() => {
            if (confirm("Reset all settings and local options data?")) {
              state.resetAllData();
            }
          }}
          variant="destructive"
        >
          <RotateCcw className="pp:h-4 pp:w-4" />
          Reset All Settings
        </Button>
      </section>
    </div>
  );
}
