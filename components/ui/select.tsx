import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("pp:scroll-my-1 pp:p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("pp:flex pp:flex-1 pp:text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "pp:flex pp:w-fit pp:items-center pp:justify-between pp:gap-1.5 pp:rounded-lg pp:border pp:border-input pp:bg-transparent pp:py-2 pp:pr-2 pp:pl-2.5 pp:text-sm pp:whitespace-nowrap pp:transition-colors pp:outline-none pp:select-none pp:focus-visible:border-ring pp:focus-visible:ring-3 pp:focus-visible:ring-ring/50 pp:disabled:cursor-not-allowed pp:disabled:opacity-50 pp:aria-invalid:border-destructive pp:aria-invalid:ring-3 pp:aria-invalid:ring-destructive/20 pp:data-placeholder:text-muted-foreground pp:data-[size=default]:h-8 pp:data-[size=sm]:h-7 pp:data-[size=sm]:rounded-[min(var(--radius-md),10px)] pp:*:data-[slot=select-value]:line-clamp-1 pp:*:data-[slot=select-value]:flex pp:*:data-[slot=select-value]:items-center pp:*:data-[slot=select-value]:gap-1.5 pp:dark:bg-input/30 pp:dark:hover:bg-input/50 pp:dark:aria-invalid:border-destructive/50 pp:dark:aria-invalid:ring-destructive/40 pp:[&_svg]:pointer-events-none pp:[&_svg]:shrink-0 pp:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pp:pointer-events-none pp:size-4 pp:text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  portalContainer,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  > & {
    portalContainer?: HTMLElement | ShadowRoot | null | React.RefObject<HTMLElement | ShadowRoot | null>
  }) {
  return (
    <SelectPrimitive.Portal container={portalContainer}>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="pp:isolate pp:z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn("pp: pp: pp:relative pp:isolate pp:z-50 pp:max-h-(--available-height) pp:w-(--anchor-width) pp:min-w-36 pp:origin-(--transform-origin) pp:overflow-x-hidden pp:overflow-y-auto pp:rounded-lg pp:bg-popover pp:text-popover-foreground pp:shadow-md pp:ring-1 pp:ring-foreground/10 pp:duration-100 pp:data-[align-trigger=true]:animate-none pp:data-[side=bottom]:slide-in-from-top-2 pp:data-[side=inline-end]:slide-in-from-left-2 pp:data-[side=inline-start]:slide-in-from-right-2 pp:data-[side=left]:slide-in-from-right-2 pp:data-[side=right]:slide-in-from-left-2 pp:data-[side=top]:slide-in-from-bottom-2 pp:data-open:animate-in pp:data-open:fade-in-0 pp:data-open:zoom-in-95 pp:data-closed:animate-out pp:data-closed:fade-out-0 pp:data-closed:zoom-out-95", className )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("pp:px-1.5 pp:py-1 pp:text-xs pp:text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "pp:relative pp:flex pp:w-full pp:cursor-default pp:items-center pp:gap-1.5 pp:rounded-md pp:py-1 pp:pr-8 pp:pl-1.5 pp:text-sm pp:outline-hidden pp:select-none pp:focus:bg-accent pp:focus:text-accent-foreground pp:not-data-[variant=destructive]:focus:**:text-accent-foreground pp:data-disabled:pointer-events-none pp:data-disabled:opacity-50 pp:[&_svg]:pointer-events-none pp:[&_svg]:shrink-0 pp:[&_svg:not([class*=size-])]:size-4 pp:*:[span]:last:flex pp:*:[span]:last:items-center pp:*:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="pp:flex pp:flex-1 pp:shrink-0 pp:gap-2 pp:whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pp:pointer-events-none pp:absolute pp:right-2 pp:flex pp:size-4 pp:items-center pp:justify-center" />
        }
      >
        <CheckIcon className="pp:pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pp:pointer-events-none pp:-mx-1 pp:my-1 pp:h-px pp:bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "pp:top-0 pp:z-10 pp:flex pp:w-full pp:cursor-default pp:items-center pp:justify-center pp:bg-popover pp:py-1 pp:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "pp:bottom-0 pp:z-10 pp:flex pp:w-full pp:cursor-default pp:items-center pp:justify-center pp:bg-popover pp:py-1 pp:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
