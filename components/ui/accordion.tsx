import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      className={cn("pp:border-border/60 pp:border-b", className)}
      data-slot="accordion-item"
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="pp:flex" data-slot="accordion-header">
      <AccordionPrimitive.Trigger
        className={cn(
          "pp:flex pp:flex-1 pp:items-center pp:justify-between pp:py-3 pp:text-left pp:font-medium pp:text-sm pp:transition-all hover:pp:no-underline [&[data-open]>svg]:pp:rotate-180 [&[data-panel-open]>svg]:pp:rotate-180",
          className
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <ChevronDownIcon className="pp:size-4 pp:shrink-0 pp:text-muted-foreground pp:transition-transform pp:duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      className={cn(
        "pp:overflow-hidden pp:text-sm pp:transition-all",
        className
      )}
      data-slot="accordion-content"
      {...props}
    >
      <div className="pp:pt-1 pp:pb-3">{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
