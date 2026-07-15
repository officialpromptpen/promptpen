"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "pp:shrink-0 pp:bg-border pp:data-horizontal:h-px pp:data-horizontal:w-full pp:data-vertical:w-px pp:data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
