import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Separator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn("h-px w-full shrink-0 border-none bg-border", className)}
      {...props}
    />
  ),
)
Separator.displayName = "Separator"

export { Separator }
