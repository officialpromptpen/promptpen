import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Separator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn("pp:h-px pp:w-full pp:shrink-0 pp:border-none pp:bg-border", className)}
      {...props}
    />
  ),
)
Separator.displayName = "Separator"

export { Separator }
