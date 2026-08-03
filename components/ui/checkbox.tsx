import { CheckIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends Omit<React.ComponentProps<"input">, "type" | "size"> {
  indicatorClassName?: string;
}

function Checkbox({ className, indicatorClassName, ...props }: CheckboxProps) {
  return (
    <span className="pp:relative pp:inline-flex pp:size-4 pp:items-center pp:justify-center">
      <input
        className={cn(
          "pp:peer pp:size-4 pp:appearance-none pp:rounded-sm pp:border pp:border-input pp:bg-background pp:outline-none pp:transition-colors pp:checked:border-primary pp:checked:bg-primary pp:focus-visible:ring-2 pp:focus-visible:ring-ring",
          className
        )}
        data-slot="checkbox"
        type="checkbox"
        {...props}
      />
      <CheckIcon
        className={cn(
          "pp:pointer-events-none pp:absolute pp:size-3 pp:text-primary-foreground pp:opacity-0 pp:transition-opacity pp:peer-checked:opacity-100",
          indicatorClassName
        )}
      />
    </span>
  );
}

export { Checkbox };
