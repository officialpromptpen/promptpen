import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "pp:z-50 pp:w-fit origin-(--radix-tooltip-content-transform-origin) pp:animate-in pp:rounded-md pp:bg-foreground pp:px-3 pp:py-1.5 pp:text-xs pp:text-balance pp:text-background pp:fade-in-0 pp:zoom-in-95 data-[side=bottom]:pp:slide-in-from-top-2 data-[side=left]:pp:slide-in-from-right-2 data-[side=right]:pp:slide-in-from-left-2 data-[side=top]:pp:slide-in-from-bottom-2 data-[state=closed]:pp:animate-out data-[state=closed]:pp:fade-out-0 data-[state=closed]:pp:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="pp:z-50 pp:size-2.5 pp:translate-y-[calc(-50%-2px)] pp:rotate-45 pp:rounded-xs pp:bg-foreground pp:fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
