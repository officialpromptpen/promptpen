import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("pp:rounded-xl pp:border pp:bg-card pp:text-card-foreground pp:shadow", className)}
      {...props}
    />
  ),
)
Card.displayName = "Card"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pp:p-6 pp:pt-0", className)} {...props} />
  ),
)
CardContent.displayName = "CardContent"

export { Card, CardContent }
