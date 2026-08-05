import { domAnimation, LazyMotion } from "framer-motion";
import { ContextualToolbarContent } from "./content";
import { TooltipProvider } from "@/components/ui/tooltip";

export function ContextualToolbar() {
  return (
    <TooltipProvider>
      <LazyMotion features={domAnimation}>
        <ContextualToolbarContent />
      </LazyMotion>
    </TooltipProvider>
  );
}
