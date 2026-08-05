import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("pp:animate-pulse pp:rounded-md pp:bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
