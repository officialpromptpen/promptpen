import { Sparkles, Zap } from "lucide-react";
import {
  POPULAR_MODELS,
  type PopularModel,
} from "@/constants/ai-providers/popular-models";
import { ProviderIcon } from "@/features/providers/provider-icons";
import type { AIProvider } from "@/types";

const ICON_TILE_STYLES: Partial<Record<AIProvider, string>> = {
  anthropic: "pp:bg-muted pp:text-foreground",
  gemini: "pp:bg-sky-100 pp:text-sky-700",
  openai: "pp:bg-foreground pp:text-background",
};

interface QuickAddPopularModelsProps {
  onSelect: (popularModel: PopularModel) => void;
}

export function QuickAddPopularModels({
  onSelect,
}: QuickAddPopularModelsProps) {
  return (
    <div>
      <div className="pp:mb-3 pp:flex pp:items-center pp:gap-2 pp:text-muted-foreground pp:text-xs pp:uppercase pp:tracking-wide">
        <Sparkles className="pp:size-3.5" />
        Quick Add: Popular Models
      </div>
      <div className="pp:grid pp:gap-3 pp:sm:grid-cols-3">
        {POPULAR_MODELS.map((popularModel) => (
          <button
            className="pp:flex pp:items-center pp:gap-3 pp:rounded-lg pp:border pp:bg-card pp:px-4 pp:py-3 pp:text-left pp:transition-colors hover:pp:bg-accent"
            key={popularModel.modelId}
            onClick={() => onSelect(popularModel)}
            type="button"
          >
            <span
              className={`pp:flex pp:size-8 pp:shrink-0 pp:items-center pp:justify-center pp:rounded-md ${
                ICON_TILE_STYLES[popularModel.provider] ??
                "pp:bg-muted pp:text-foreground"
              }`}
            >
              {popularModel.provider === "openai" ? (
                <Zap className="pp:size-4" />
              ) : (
                <ProviderIcon
                  className="pp:size-4"
                  provider={popularModel.provider}
                />
              )}
            </span>
            <span className="pp:min-w-0">
              <span className="pp:block pp:truncate pp:font-medium pp:text-sm">
                {popularModel.label}
              </span>
              <span className="pp:block pp:truncate pp:text-muted-foreground pp:text-xs">
                {popularModel.providerLabel}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
