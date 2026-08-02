import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      className={cn("pp:scroll-my-1 pp:p-1", className)}
      data-slot="select-group"
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      className={cn("pp:flex pp:flex-1 pp:text-left", className)}
      data-slot="select-value"
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "pp:flex pp:w-fit pp:select-none pp:items-center pp:justify-between pp:gap-1.5 pp:whitespace-nowrap pp:rounded-lg pp:border pp:border-input pp:bg-transparent pp:py-2 pp:pr-2 pp:pl-2.5 pp:text-sm pp:outline-none pp:transition-colors pp:focus-visible:border-ring pp:focus-visible:ring-3 pp:focus-visible:ring-ring/50 pp:disabled:cursor-not-allowed pp:disabled:opacity-50 pp:aria-invalid:border-destructive pp:aria-invalid:ring-3 pp:aria-invalid:ring-destructive/20 pp:data-[size=default]:h-8 pp:data-[size=sm]:h-7 pp:data-[size=sm]:rounded-[min(var(--radius-md),10px)] pp:data-placeholder:text-muted-foreground pp:*:data-[slot=select-value]:line-clamp-1 pp:*:data-[slot=select-value]:flex pp:*:data-[slot=select-value]:items-center pp:*:data-[slot=select-value]:gap-1.5 pp:dark:bg-input/30 pp:dark:aria-invalid:border-destructive/50 pp:dark:aria-invalid:ring-destructive/40 pp:dark:hover:bg-input/50 pp:[&_svg:not([class*=size-])]:size-4 pp:[&_svg]:pointer-events-none pp:[&_svg]:shrink-0",
        className
      )}
      data-size={size}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pp:pointer-events-none pp:size-4 pp:text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  );
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
    portalContainer?:
      | HTMLElement
      | ShadowRoot
      | null
      | React.RefObject<HTMLElement | ShadowRoot | null>;
  }) {
  return (
    <SelectPrimitive.Portal container={portalContainer}>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        className="pp:isolate pp:z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className={cn(
            "pp: pp:data-[side=bottom]:slide-in-from-top-2 pp:data-[side=inline-end]:slide-in-from-left-2 pp:data-[side=inline-start]:slide-in-from-right-2 pp:data-[side=left]:slide-in-from-right-2 pp:data-[side=right]:slide-in-from-left-2 pp:data-[side=top]:slide-in-from-bottom-2 pp:data-open:fade-in-0 pp:data-open:zoom-in-95 pp:data-closed:fade-out-0 pp:data-closed:zoom-out-95 pp:relative pp:isolate pp:z-50 pp:max-h-(--available-height) pp:w-(--anchor-width) pp:min-w-36 pp:origin-(--transform-origin) pp:overflow-y-auto pp:overflow-x-hidden pp:rounded-lg pp:bg-popover pp:text-popover-foreground pp:shadow-md pp:ring-1 pp:ring-foreground/10 pp:duration-100 pp:data-[align-trigger=true]:animate-none pp:data-closed:animate-out pp:data-open:animate-in",
            className
          )}
          data-align-trigger={alignItemWithTrigger}
          data-slot="select-content"
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      className={cn(
        "pp:px-1.5 pp:py-1 pp:text-muted-foreground pp:text-xs",
        className
      )}
      data-slot="select-label"
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "pp:relative pp:flex pp:w-full pp:cursor-default pp:select-none pp:items-center pp:gap-1.5 pp:rounded-md pp:py-1 pp:pr-8 pp:pl-1.5 pp:text-sm pp:outline-hidden pp:focus:bg-accent pp:focus:text-accent-foreground pp:not-data-[variant=destructive]:focus:**:text-accent-foreground pp:data-disabled:pointer-events-none pp:data-disabled:opacity-50 pp:[&_svg:not([class*=size-])]:size-4 pp:[&_svg]:pointer-events-none pp:[&_svg]:shrink-0 pp:*:[span]:last:flex pp:*:[span]:last:items-center pp:*:[span]:last:gap-2",
        className
      )}
      data-slot="select-item"
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
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      className={cn(
        "pp:pointer-events-none pp:-mx-1 pp:my-1 pp:h-px pp:bg-border",
        className
      )}
      data-slot="select-separator"
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      className={cn(
        "pp:top-0 pp:z-10 pp:flex pp:w-full pp:cursor-default pp:items-center pp:justify-center pp:bg-popover pp:py-1 pp:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      data-slot="select-scroll-up-button"
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      className={cn(
        "pp:bottom-0 pp:z-10 pp:flex pp:w-full pp:cursor-default pp:items-center pp:justify-center pp:bg-popover pp:py-1 pp:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      data-slot="select-scroll-down-button"
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
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
};
