import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "pp:inline-flex pp:items-center pp:rounded-md pp:border pp:px-2.5 pp:py-0.5 pp:text-xs pp:font-semibold pp:transition-colors focus:pp:outline-none focus:pp:ring-2 focus:pp:ring-ring focus:pp:ring-offset-2",
  {
    variants: {
      variant: {
        default: "pp:border-transparent pp:bg-primary pp:text-primary-foreground pp:shadow",
        secondary: "pp:border-transparent pp:bg-secondary pp:text-secondary-foreground",
        destructive: "pp:border-transparent pp:bg-destructive pp:text-destructive-foreground pp:shadow",
        outline: "pp:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, ...props }, ref) => {
  return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
})
Badge.displayName = "Badge"

export { Badge }
