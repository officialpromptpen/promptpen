import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";
import type { AIProviderOption } from "@/components/ai-provider-constants";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { ProviderIcon } from "@/features/providers/provider-icons";
import { setDefaultProvider } from "@/features/providers/storage";
import { cn } from "@/lib/utils";
import type { AIProvider } from "@/types";

export interface AIProviderSelectIconProps {
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  onValueChange?: (value: string | null) => void;
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

function ShadowSelectContent({
  children,
  container,
  className,
}: {
  children: React.ReactNode;
  container: HTMLElement | ShadowRoot | null;
  className?: string;
}) {
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner
        alignItemWithTrigger
        className="pp:z-2147483647"
        side="bottom"
        sideOffset={4}
      >
        <SelectPrimitive.Popup
          className={cn(
            "pp:data-open:fade-in-0 pp:data-open:zoom-in-95 pp:data-closed:fade-out-0 pp:data-closed:zoom-out-95 pp:z-2147483647 pp:max-h-(--available-height) pp:w-(--anchor-width) pp:min-w-36 pp:overflow-y-auto pp:overflow-x-hidden pp:rounded-lg pp:bg-popover pp:text-popover-foreground pp:shadow-md pp:ring-1 pp:ring-foreground/10 pp:data-closed:animate-out pp:data-open:animate-in",
            className
          )}
          data-slot="select-content"
        >
          <SelectPrimitive.ScrollUpArrow className="pp:flex pp:w-full pp:items-center pp:justify-center pp:bg-popover pp:py-1">
            <ChevronUpIcon className="pp:size-4" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className="pp:flex pp:w-full pp:items-center pp:justify-center pp:bg-popover pp:py-1">
            <ChevronDownIcon className="pp:size-4" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export const AIProviderSelectIcon = React.forwardRef<
  HTMLButtonElement,
  AIProviderSelectIconProps
>(
  (
    {
      value,
      onValueChange,
      providers,
      disabled = false,
      size = "default",
      className,
      contentClassName,
    },
    ref
  ) => {
    const selectedName = providers.find((p) => p.id === value)?.name ?? "";
    const groups = React.useMemo(() => groupProviders(providers), [providers]);

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [portalContainer, setPortalContainer] = React.useState<
      HTMLElement | ShadowRoot | null
    >(null);

    React.useEffect(() => {
      const rootNode = wrapperRef.current?.getRootNode();
      if (rootNode instanceof ShadowRoot) {
        const body = rootNode.querySelector("body");
        setPortalContainer(body ?? rootNode);
      }
    }, []);

    return (
      <div className="pp:contents" ref={wrapperRef}>
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
            aria-label={`Select AI Provider${value ? `: ${selectedName}` : ""}`}
            className={cn("pp:rounded-md pp:border-border/70", className)}
            ref={ref}
            size={size}
            title={value ? selectedName : undefined}
          >
            <div className="pp:flex pp:items-center pp:gap-2">
              {value ? (
                <ProviderIcon
                  className="pp:size-4"
                  provider={value as AIProvider}
                />
              ) : null}
            </div>
          </SelectTrigger>

          <ShadowSelectContent
            className={cn("pp:max-h-80", contentClassName)}
            container={portalContainer}
          >
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
          </ShadowSelectContent>
        </Select>
      </div>
    );
  }
);

AIProviderSelectIcon.displayName = "AIProviderSelectIcon";
