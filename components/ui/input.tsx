import type * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "pp:flex pp:h-9 pp:w-full pp:rounded-lg pp:border pp:border-input pp:bg-background pp:px-3 pp:py-1.5 pp:text-sm pp:shadow-xs pp:outline-none pp:transition-colors pp:focus-visible:border-ring pp:focus-visible:ring-3 pp:focus-visible:ring-ring/50 pp:disabled:cursor-not-allowed pp:disabled:opacity-50",
        className
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input };
