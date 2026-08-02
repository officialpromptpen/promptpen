import { domAnimation, LazyMotion } from "framer-motion";
import { ContextualToolbarContent } from "./content";

export function ContextualToolbar() {
  return (
    <LazyMotion features={domAnimation}>
      <ContextualToolbarContent />
    </LazyMotion>
  );
}
