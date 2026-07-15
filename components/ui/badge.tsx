import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "pp:group/badge pp:inline-flex pp:h-5 pp:w-fit pp:shrink-0 pp:items-center pp:justify-center pp:gap-1 pp:overflow-hidden pp:rounded-4xl pp:border pp:border-transparent pp:px-2 pp:py-0.5 pp:text-xs pp:font-medium pp:whitespace-nowrap pp:transition-all pp:focus-visible:border-ring pp:focus-visible:ring-[3px] pp:focus-visible:ring-ring/50 pp:has-data-[icon=inline-end]:pr-1.5 pp:has-data-[icon=inline-start]:pl-1.5 pp:aria-invalid:border-destructive pp:aria-invalid:ring-destructive/20 pp:dark:aria-invalid:ring-destructive/40 pp:[&>svg]:pointer-events-none pp:[&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "pp:bg-primary pp:text-primary-foreground pp:[a]:hover:bg-primary/80",
        secondary:
          "pp:bg-secondary pp:text-secondary-foreground pp:[a]:hover:bg-secondary/80",
        destructive:
          "pp:bg-destructive/10 pp:text-destructive pp:focus-visible:ring-destructive/20 pp:dark:bg-destructive/20 pp:dark:focus-visible:ring-destructive/40 pp:[a]:hover:bg-destructive/20",
        outline:
          "pp:border-border pp:text-foreground pp:[a]:hover:bg-muted pp:[a]:hover:text-muted-foreground",
        ghost:
          "pp:hover:bg-muted pp:hover:text-muted-foreground pp:dark:hover:bg-muted/50",
        link: "pp:text-primary pp:underline-offset-4 pp:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
