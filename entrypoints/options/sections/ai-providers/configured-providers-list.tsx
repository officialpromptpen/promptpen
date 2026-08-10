import {
  CheckCircle2,
  CloudOff,
  Edit3,
  RefreshCw,
  Star,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProviderIcon } from "@/features/providers/provider-icons";
import { cn } from "@/lib/utils";
import type {
  AIProvider,
  ConfiguredProviderDetail,
  ConnectionStatus,
  OptionsState,
} from "@/types";

const STATUS_META: Record<
  ConnectionStatus,
  {
    badgeClass: string;
    icon: typeof CheckCircle2;
    iconClass: string;
    label: string;
  }
> = {
  connected: {
    badgeClass: "pp:bg-green-500/10 pp:text-green-700",
    icon: CheckCircle2,
    iconClass: "pp:bg-green-500/10 pp:text-green-600",
    label: "CONNECTED",
  },
  error: {
    badgeClass: "pp:bg-red-500/10 pp:text-red-600",
    icon: TriangleAlert,
    iconClass: "pp:bg-red-500/10 pp:text-red-600",
    label: "AUTH ERROR",
  },
  inactive: {
    badgeClass: "pp:bg-muted pp:text-muted-foreground",
    icon: CloudOff,
    iconClass: "pp:bg-muted pp:text-muted-foreground",
    label: "INACTIVE",
  },
};

interface ConfiguredProvidersListProps {
  configuredProviderDetails: OptionsState["configuredProviderDetails"];
  handleDeleteProvider: OptionsState["handleDeleteProvider"];
  handleEditProvider: OptionsState["handleEditProvider"];
  onRetryConnection: (provider: AIProvider) => void;
  onSetDefault?: (provider: AIProvider, model: string) => void;
  selectedProvider: OptionsState["selectedProvider"];
  title?: string;
}

export function ConfiguredProvidersList({
  configuredProviderDetails,
  handleDeleteProvider,
  handleEditProvider,
  onRetryConnection,
  onSetDefault,
  selectedProvider,
  title,
}: ConfiguredProvidersListProps) {
  if (configuredProviderDetails.length === 0) {
    return null;
  }

  const heading = title
    ? `${title} (${configuredProviderDetails.length})`
    : `Active Connections (${configuredProviderDetails.length})`;

  return (
    <div
      className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm"
      id="pp-tour-provider-setup"
    >
      <h2 className="pp:mb-4 pp:font-semibold pp:text-muted-foreground pp:text-xs pp:uppercase pp:tracking-wide">
        {heading}
      </h2>

      <div className="pp:space-y-2">
        {configuredProviderDetails.map((detail) => {
          const isCurrentlySelected = detail.provider === selectedProvider;

          return (
            <ProviderDetailRow
              detail={detail}
              isCurrentlySelected={isCurrentlySelected}
              key={detail.id || `${detail.provider}:${detail.model}`}
              onConfirmDelete={async () => {
                const accepted = globalThis.confirm(
                  `Remove ${detail.label} (${detail.model}) configuration?`
                );
                if (!accepted) {
                  return;
                }
                await handleDeleteProvider(detail.provider, detail.model);
              }}
              onEdit={() => {
                handleEditProvider(detail.provider, detail.model);
              }}
              onRetry={() => onRetryConnection(detail.provider)}
              onSetDefault={onSetDefault}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ProviderDetailRowProps {
  detail: ConfiguredProviderDetail;
  isCurrentlySelected: boolean;
  onConfirmDelete: () => void;
  onEdit: () => void;
  onRetry: () => void;
  onSetDefault?: (provider: AIProvider, model: string) => void;
}

function ProviderDetailRow({
  detail,
  isCurrentlySelected,
  onConfirmDelete,
  onEdit,
  onRetry,
  onSetDefault,
}: ProviderDetailRowProps) {
  const statusMeta = STATUS_META[detail.status];
  const isDefault = detail.status === "connected";

  return (
    <div
      className={cn(
        "pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:px-4 pp:py-3 pp:transition-colors",
        isCurrentlySelected
          ? "pp:border-primary/40 pp:bg-primary/5"
          : "pp:bg-card"
      )}
    >
      <div className="pp:flex pp:min-w-0 pp:items-center pp:gap-3">
        <div
          className="pp:flex pp:size-10 pp:shrink-0 pp:items-center pp:justify-center pp:rounded-full pp:border pp:bg-muted/30"
        >
          <ProviderIcon className="pp:size-5" provider={detail.provider} />
        </div>
        <div className="pp:flex pp:min-w-0 pp:flex-col pp:gap-0.5">
          <span className="pp:font-medium pp:text-foreground pp:text-sm">
            {detail.label}
          </span>
          <span className="pp:truncate pp:text-muted-foreground pp:text-xs">
            ID: {detail.model}
          </span>
        </div>
      </div>

      <div className="pp:ml-2 pp:flex pp:shrink-0 pp:items-center pp:gap-2">
        {isDefault ? (
          <span className="pp:inline-flex pp:items-center pp:gap-1 pp:rounded-full pp:bg-amber-500/10 pp:px-2.5 pp:py-0.5 pp:font-semibold pp:text-amber-600 pp:text-xs dark:pp:text-amber-400">
            <Star className="pp:size-3 pp:fill-amber-500 pp:text-amber-500" />
            DEFAULT
          </span>
        ) : (
          onSetDefault && (
            <Button
              aria-label={`Set ${detail.label} (${detail.model}) as default`}
              className="pp:h-7 pp:gap-1 pp:rounded-md pp:px-2.5 pp:text-xs"
              onClick={() => onSetDefault(detail.provider, detail.model)}
              title={`Set ${detail.label} (${detail.model}) as default provider and model`}
              type="button"
              variant="outline"
            >
              <Star className="pp:size-3.5 pp:text-muted-foreground" />
              Set Default
            </Button>
          )
        )}

        <span
          className={cn(
            "pp:inline-flex pp:items-center pp:gap-1 pp:rounded-full pp:px-2 pp:py-0.5 pp:font-medium pp:text-xs",
            statusMeta.badgeClass
          )}
        >
          <span
            className={cn(
              "pp:size-1.5 pp:rounded-full",
              detail.status === "connected" && "pp:bg-green-600",
              detail.status === "error" && "pp:bg-red-600",
              detail.status === "inactive" && "pp:bg-muted-foreground"
            )}
          />
          {statusMeta.label}
        </span>

        <div className="pp:flex pp:items-center pp:gap-1">
          {detail.status === "error" ? (
            <Button
              aria-label={`Retry ${detail.label} connection`}
              onClick={onRetry}
              title={`Retry ${detail.label} connection`}
              type="button"
              variant="ghost"
            >
              <RefreshCw aria-hidden="true" className="pp:size-4" />
            </Button>
          ) : (
            <Button
              aria-label={`Edit ${detail.label}`}
              onClick={onEdit}
              title={`Edit ${detail.label}`}
              type="button"
              variant="ghost"
            >
              <Edit3 aria-hidden="true" className="pp:size-4" />
            </Button>
          )}
          <Button
            aria-label={`Delete ${detail.label}`}
            onClick={onConfirmDelete}
            title={`Delete ${detail.label}`}
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" className="pp:size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
