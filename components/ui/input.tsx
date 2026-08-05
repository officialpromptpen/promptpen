import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "pp:h-8 pp:w-full pp:min-w-0 pp:rounded-lg pp:border pp:border-input pp:bg-transparent pp:px-2.5 pp:py-1 pp:text-base pp:transition-colors pp:outline-none pp:file:inline-flex pp:file:h-6 pp:file:border-0 pp:file:bg-transparent pp:file:text-sm pp:file:font-medium pp:file:text-foreground pp:placeholder:text-muted-foreground pp:focus-visible:border-ring pp:focus-visible:ring-3 pp:focus-visible:ring-ring/50 pp:disabled:pointer-events-none pp:disabled:cursor-not-allowed pp:disabled:bg-input/50 pp:disabled:opacity-50 pp:aria-invalid:border-destructive pp:aria-invalid:ring-3 pp:aria-invalid:ring-destructive/20 pp:md:text-sm pp:dark:bg-input/30 pp:dark:disabled:bg-input/80 pp:dark:aria-invalid:border-destructive/50 pp:dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
