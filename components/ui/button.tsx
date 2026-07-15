import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "pp:group/button pp:inline-flex pp:shrink-0 pp:items-center pp:justify-center pp:rounded-lg pp:border pp:border-transparent pp:bg-clip-padding pp:text-sm pp:font-medium pp:whitespace-nowrap pp:transition-all pp:outline-none pp:select-none pp:focus-visible:border-ring pp:focus-visible:ring-3 pp:focus-visible:ring-ring/50 pp:active:not-aria-[haspopup]:translate-y-px pp:disabled:pointer-events-none pp:disabled:opacity-50 pp:aria-invalid:border-destructive pp:aria-invalid:ring-3 pp:aria-invalid:ring-destructive/20 pp:dark:aria-invalid:border-destructive/50 pp:dark:aria-invalid:ring-destructive/40 pp:[&_svg]:pointer-events-none pp:[&_svg]:shrink-0 pp:[&_svg:not([class*=size-])]:size-4",
  {
    variants: {
      variant: {
        default: "pp:bg-primary pp:text-primary-foreground pp:hover:bg-primary/80",
        outline:
          "pp:border-border pp:bg-background pp:hover:bg-muted pp:hover:text-foreground pp:aria-expanded:bg-muted pp:aria-expanded:text-foreground pp:dark:border-input pp:dark:bg-input/30 pp:dark:hover:bg-input/50",
        secondary:
          "pp:bg-secondary pp:text-secondary-foreground pp:hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] pp:aria-expanded:bg-secondary pp:aria-expanded:text-secondary-foreground",
        ghost:
          "pp:hover:bg-muted pp:hover:text-foreground pp:aria-expanded:bg-muted pp:aria-expanded:text-foreground pp:dark:hover:bg-muted/50",
        destructive:
          "pp:bg-destructive/10 pp:text-destructive pp:hover:bg-destructive/20 pp:focus-visible:border-destructive/40 pp:focus-visible:ring-destructive/20 pp:dark:bg-destructive/20 pp:dark:hover:bg-destructive/30 pp:dark:focus-visible:ring-destructive/40",
        link: "pp:text-primary pp:underline-offset-4 pp:hover:underline",
      },
      size: {
        default:
          "pp:h-8 pp:gap-1.5 pp:px-2.5 pp:has-data-[icon=inline-end]:pr-2 pp:has-data-[icon=inline-start]:pl-2",
        xs: "pp:h-6 pp:gap-1 pp:rounded-[min(var(--radius-md),10px)] pp:px-2 pp:text-xs pp:in-data-[slot=button-group]:rounded-lg pp:has-data-[icon=inline-end]:pr-1.5 pp:has-data-[icon=inline-start]:pl-1.5 pp:[&_svg:not([class*=size-])]:size-3",
        sm: "pp:h-7 pp:gap-1 pp:rounded-[min(var(--radius-md),12px)] pp:px-2.5 pp:text-[0.8rem] pp:in-data-[slot=button-group]:rounded-lg pp:has-data-[icon=inline-end]:pr-1.5 pp:has-data-[icon=inline-start]:pl-1.5 pp:[&_svg:not([class*=size-])]:size-3.5",
        lg: "pp:h-9 pp:gap-1.5 pp:px-2.5 pp:has-data-[icon=inline-end]:pr-2 pp:has-data-[icon=inline-start]:pl-2",
        icon: "pp:size-8",
        "icon-xs":
          "pp:size-6 pp:rounded-[min(var(--radius-md),10px)] pp:in-data-[slot=button-group]:rounded-lg pp:[&_svg:not([class*=size-])]:size-3",
        "icon-sm":
          "pp:size-7 pp:rounded-[min(var(--radius-md),12px)] pp:in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "pp:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
