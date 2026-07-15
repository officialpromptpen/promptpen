import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "pp:group/card pp:flex pp:flex-col pp:gap-(--card-spacing) pp:overflow-hidden pp:rounded-xl pp:bg-card pp:py-(--card-spacing) pp:text-sm pp:text-card-foreground pp:ring-1 pp:ring-foreground/10 pp:[--card-spacing:--spacing(4)] pp:has-data-[slot=card-footer]:pb-0 pp:has-[>img:first-child]:pt-0 pp:data-[size=sm]:[--card-spacing:--spacing(3)] pp:data-[size=sm]:has-data-[slot=card-footer]:pb-0 pp:*:[img:first-child]:rounded-t-xl pp:*:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "pp:group/card-header pp:@container/card-header pp:grid pp:auto-rows-min pp:items-start pp:gap-1 pp:rounded-t-xl pp:px-(--card-spacing) pp:has-data-[slot=card-action]:grid-cols-[1fr_auto] pp:has-data-[slot=card-description]:grid-rows-[auto_auto] pp:[.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "pp: pp:text-base pp:leading-snug pp:font-medium pp:group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("pp:text-sm pp:text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "pp:col-start-2 pp:row-span-2 pp:row-start-1 pp:self-start pp:justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("pp:px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "pp:flex pp:items-center pp:rounded-b-xl pp:border-t pp:bg-muted/50 pp:p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
