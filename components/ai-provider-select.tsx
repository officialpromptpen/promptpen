import * as React from "react";
import type { AIProviderOption } from "@/components/ai-provider-constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { ProviderIcon } from "@/features/providers/provider-icons";
import { setDefaultProvider } from "@/features/providers/storage";
import type { AIProvider } from "@/types";

export interface AIProviderSelectDefaultProps {
  className?: string;
  disabled?: boolean;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  providers: AIProviderOption[];
  size?: "sm" | "default";
  value?: string;
}

function groupProviders(providers: AIProviderOption[]) {
  const map = new Map<string, AIProviderOption[]>();
  for (const p of providers) {
    const group = map.get(p.group);
    if (group) {
      group.push(p);
    } else {
      map.set(p.group, [p]);
    }
  }
  return Array.from(map.entries());
}

export const AIProviderSelectDefault = React.forwardRef<
  HTMLButtonElement,
  AIProviderSelectDefaultProps
>(
  (
    {
      value,
      onValueChange,
      providers,
      placeholder = "Select AI Provider",
      disabled = false,
      size = "default",
      className,
    },
    ref
  ) => {
    const selectedName = providers.find((p) => p.id === value)?.name ?? "";
    const groups = React.useMemo(() => groupProviders(providers), [providers]);

    return (
      <Select
        disabled={disabled}
        onValueChange={(newValue) => {
          if (newValue) {
            setDefaultProvider(newValue as AIProvider);
          }
          onValueChange?.(newValue);
        }}
        value={value}
      >
        <SelectTrigger
          aria-label="Select AI Provider"
          className={className}
          ref={ref}
          size={size}
        >
          {value ? (
            <div className="pp:flex pp:items-center pp:gap-2">
              <ProviderIcon
                className="pp:size-4"
                provider={value as AIProvider}
              />
              <span className="pp:px-1 pp:py-1 pp:text-foreground pp:capitalize">
                {selectedName}
              </span>
            </div>
          ) : (
            <div className="pp:flex pp:items-center pp:gap-2">
              <span className="pp:px-2 pp:py-1 pp:text-sm pp:capitalize">
                {placeholder}
              </span>
            </div>
          )}
        </SelectTrigger>

        <SelectContent>
          {groups.length === 0 ? (
            <div className="pp:p-3 pp:text-muted-foreground pp:text-sm">
              No providers available
            </div>
          ) : (
            groups.map(([groupLabel, groupProviders]) => (
              <SelectGroup key={groupLabel}>
                <SelectLabel className="pp:font-semibold pp:text-muted-foreground pp:text-xs pp:uppercase pp:tracking-wide">
                  {groupLabel}
                </SelectLabel>
                {groupProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="pp:flex pp:items-center pp:gap-2">
                      <ProviderIcon
                        className="pp:size-4"
                        provider={provider.id as AIProvider}
                      />
                      <span>{provider.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          )}
        </SelectContent>
      </Select>
    );
  }
);

AIProviderSelectDefault.displayName = "AIProviderSelectDefault";
