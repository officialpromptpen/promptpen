import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pp:inline-flex pp:items-center pp:justify-center pp:gap-2 pp:whitespace-nowrap pp:rounded-md pp:text-sm pp:font-medium pp:transition-all disabled:pp:pointer-events-none disabled:pp:opacity-50 [&_svg]:pp:pointer-events-none [&_svg:not([class*='size-'])]:pp:size-4 pp:shrink-0 [&_svg]:pp:shrink-0 pp:outline-none focus-visible:pp:border-ring focus-visible:pp:ring-ring/50 focus-visible:pp:ring-[3px] aria-invalid:pp:ring-destructive/20 dark:aria-invalid:pp:ring-destructive/40 aria-invalid:pp:border-destructive",
  {
    variants: {
      variant: {
        default:
          "pp:bg-primary pp:text-primary-foreground pp:shadow-xs hover:pp:bg-primary/90",
        destructive:
          "pp:bg-destructive pp:text-white pp:shadow-xs hover:pp:bg-destructive/90 focus-visible:pp:ring-destructive/20 dark:focus-visible:pp:ring-destructive/40 dark:pp:bg-destructive/60",
        outline:
          "pp:border pp:bg-background pp:shadow-xs hover:pp:bg-accent hover:pp:text-accent-foreground dark:pp:bg-input/30 dark:pp:border-input dark:hover:pp:bg-input/50",
        secondary:
          "pp:bg-secondary pp:text-secondary-foreground pp:shadow-xs hover:pp:bg-secondary/80",
        ghost:
          "hover:pp:bg-accent hover:pp:text-accent-foreground dark:hover:pp:bg-accent/50",
        link: "pp:text-primary pp:underline-offset-4 hover:pp:underline",
      },
      size: {
        default: "pp:h-9 pp:px-4 pp:py-2 has-[>svg]:pp:px-3",
        sm: "pp:h-8 pp:rounded-md pp:gap-1.5 pp:px-3 has-[>svg]:pp:px-2.5",
        lg: "pp:h-10 pp:rounded-md pp:px-6 has-[>svg]:pp:px-4",
        icon: "pp:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
