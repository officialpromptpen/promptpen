import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "pp:fixed pp:inset-0 pp:z-50 pp:bg-black/10 pp:transition-opacity pp:duration-150 pp:data-ending-style:opacity-0 pp:data-starting-style:opacity-0 pp:supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "pp:fixed pp:z-50 pp:flex pp:flex-col pp:gap-4 pp:bg-popover pp:bg-clip-padding pp:text-sm pp:text-popover-foreground pp:shadow-lg pp:transition pp:duration-200 pp:ease-in-out pp:data-ending-style:opacity-0 pp:data-starting-style:opacity-0 pp:data-[side=bottom]:inset-x-0 pp:data-[side=bottom]:bottom-0 pp:data-[side=bottom]:h-auto pp:data-[side=bottom]:border-t pp:data-[side=bottom]:data-ending-style:translate-y-[2.5rem] pp:data-[side=bottom]:data-starting-style:translate-y-[2.5rem] pp:data-[side=left]:inset-y-0 pp:data-[side=left]:left-0 pp:data-[side=left]:h-full pp:data-[side=left]:w-3/4 pp:data-[side=left]:border-r pp:data-[side=left]:data-ending-style:translate-x-[-2.5rem] pp:data-[side=left]:data-starting-style:translate-x-[-2.5rem] pp:data-[side=right]:inset-y-0 pp:data-[side=right]:right-0 pp:data-[side=right]:h-full pp:data-[side=right]:w-3/4 pp:data-[side=right]:border-l pp:data-[side=right]:data-ending-style:translate-x-[2.5rem] pp:data-[side=right]:data-starting-style:translate-x-[2.5rem] pp:data-[side=top]:inset-x-0 pp:data-[side=top]:top-0 pp:data-[side=top]:h-auto pp:data-[side=top]:border-b pp:data-[side=top]:data-ending-style:translate-y-[-2.5rem] pp:data-[side=top]:data-starting-style:translate-y-[-2.5rem] pp:data-[side=left]:sm:max-w-sm pp:data-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="pp:absolute pp:top-3 pp:right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="pp:sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("pp:flex pp:flex-col pp:gap-0.5 pp:p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("pp:mt-auto pp:flex pp:flex-col pp:gap-2 pp:p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "pp: pp:text-base pp:font-medium pp:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("pp:text-sm pp:text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
