import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select"
import { ProviderIcon } from "@/features/providers/provider-icons"
import { cn } from "@/lib/utils"
import type { AIProviderOption } from "@/components/ai-provider-constants"
import type { AIProvider } from "@/types"

export interface AIProviderSelectIconProps {
  value?: string
  onValueChange?: (value: string | null) => void
  providers: AIProviderOption[]
  disabled?: boolean
  size?: "sm" | "default"
  className?: string
  contentClassName?: string
}

function groupProviders(providers: AIProviderOption[]) {
  const map = new Map<string, AIProviderOption[]>()
  for (const p of providers) {
    const group = map.get(p.group)
    if (group) {
      group.push(p)
    } else {
      map.set(p.group, [p])
    }
  }
  return Array.from(map.entries())
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
    ref,
  ) => {
    const selectedName = providers.find((p) => p.id === value)?.name ?? ""
    const groups = React.useMemo(() => groupProviders(providers), [providers])

    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const [portalContainer, setPortalContainer] = React.useState<
      HTMLElement | ShadowRoot | null
    >(null)

    React.useEffect(() => {
      const rootNode = wrapperRef.current?.getRootNode()
      if (rootNode instanceof ShadowRoot) {
        setPortalContainer(
          rootNode.getElementById("pp:root") ?? rootNode,
        )
      }
    }, [])

    return (
      <div ref={wrapperRef} className="pp:contents">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            size={size}
            title={value ? selectedName : undefined}
            className={cn("pp:rounded-md pp:bg-red-500 pp:border-border/70", className)}
            aria-label={`Select AI Provider${value ? `: ${selectedName}` : ""}`}
          >
            <div className="pp:flex pp:items-center pp:gap-2">
              {value ? (
                <ProviderIcon
                  provider={value as AIProvider}
                  className="pp:size-4"
                />
              ) : (
                <div className="pp:flex pp:items-center pp:gap-2">
                  <span className="pp:text-sm pp:py-1 pp:px-2 pp:capitalize">{selectedName}</span>
                </div>
              )}
            </div>
          </SelectTrigger>

          <SelectContent
            portalContainer={portalContainer}
            className={cn("pp:max-h-80 pp:bg-red-900", contentClassName)}
          >
            {groups.length === 0 ? (
              <div className="pp:p-3 pp:text-sm pp:text-muted-foreground">
                No providers available
              </div>
            ) : (
              groups.map(([groupLabel, groupProviders]) => (
                <SelectGroup key={groupLabel}>
                  <SelectLabel className="pp:font-semibold pp:text-xs pp:uppercase pp:tracking-wide pp:text-muted-foreground">
                    {groupLabel}
                  </SelectLabel>
                  {groupProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="pp:flex pp:items-center pp:gap-2">
                        <ProviderIcon
                          provider={provider.id as AIProvider}
                          className="pp:size-4"
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
      </div>
    )
  },
)

AIProviderSelectIcon.displayName = "AIProviderSelectIcon"
