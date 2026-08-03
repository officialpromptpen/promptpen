import type * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "pp:font-medium pp:text-sm pp:leading-none pp:peer-disabled:cursor-not-allowed pp:peer-disabled:opacity-70",
        className
      )}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
