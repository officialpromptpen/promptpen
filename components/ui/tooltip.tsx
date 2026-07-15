import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="pp:isolate pp:z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "pp:z-50 pp:inline-flex pp:w-fit pp:max-w-xs pp:origin-(--transform-origin) pp:items-center pp:gap-1.5 pp:rounded-md pp:bg-foreground pp:px-3 pp:py-1.5 pp:text-xs pp:text-background pp:has-data-[slot=kbd]:pr-1.5 pp:data-[side=bottom]:slide-in-from-top-2 pp:data-[side=inline-end]:slide-in-from-left-2 pp:data-[side=inline-start]:slide-in-from-right-2 pp:data-[side=left]:slide-in-from-right-2 pp:data-[side=right]:slide-in-from-left-2 pp:data-[side=top]:slide-in-from-bottom-2 pp:**:data-[slot=kbd]:relative pp:**:data-[slot=kbd]:isolate pp:**:data-[slot=kbd]:z-50 pp:**:data-[slot=kbd]:rounded-sm pp:data-[state=delayed-open]:animate-in pp:data-[state=delayed-open]:fade-in-0 pp:data-[state=delayed-open]:zoom-in-95 pp:data-open:animate-in pp:data-open:fade-in-0 pp:data-open:zoom-in-95 pp:data-closed:animate-out pp:data-closed:fade-out-0 pp:data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="pp:z-50 pp:size-2.5 pp:translate-y-[calc(-50%-2px)] pp:rotate-45 pp:rounded-[2px] pp:bg-foreground pp:fill-foreground pp:data-[side=bottom]:top-1 pp:data-[side=inline-end]:top-1/2! pp:data-[side=inline-end]:-left-1 pp:data-[side=inline-end]:-translate-y-1/2 pp:data-[side=inline-start]:top-1/2! pp:data-[side=inline-start]:-right-1 pp:data-[side=inline-start]:-translate-y-1/2 pp:data-[side=left]:top-1/2! pp:data-[side=left]:-right-1 pp:data-[side=left]:-translate-y-1/2 pp:data-[side=right]:top-1/2! pp:data-[side=right]:-left-1 pp:data-[side=right]:-translate-y-1/2 pp:data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
