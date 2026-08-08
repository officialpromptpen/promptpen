import { domAnimation, LazyMotion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContextualToolbarContent } from "./content";

export function ContextualToolbar() {
  return (
    <TooltipProvider>
      <LazyMotion features={domAnimation}>
        <ContextualToolbarContent />
      </LazyMotion>
    </TooltipProvider>
  );
}
