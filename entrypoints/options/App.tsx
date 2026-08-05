import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import {
  Bug,
  Info,
  Lightbulb,
  Loader2,
  MessagesSquare,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { Logo } from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { sections } from "@/constants/options";
import { getTourStep, startDashboardTour } from "@/features/onboarding/tour";
import { cn } from "@/lib/utils";
import { useOptionsState } from "./hooks/use-options-state";
import { AdvancedSection } from "./sections/advanced";
import { AIProvidersSection } from "./sections/ai-providers";
import { AppearanceSection } from "./sections/appearance";
import { CustomPromptsSection } from "./sections/custom-prompts";
import { GeneralSection } from "./sections/general";
import { SelfHostedSection } from "./sections/self-hosted";
import { WebsiteAccessSection } from "./sections/website-access";

function IndexOptions() {
  const state = useOptionsState();
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function maybeStartTour() {
      const step = await getTourStep();
      if (!mounted || step !== "dashboard") {
        return;
      }
      startDashboardTour(state.setActiveSection);
    }

    void maybeStartTour();

    return () => {
      mounted = false;
    };
  }, [state.setActiveSection]);

  function renderSection() {
    switch (state.activeSection) {
      case "general":
        return <GeneralSection {...state} />;
      case "ai-providers":
        return <AIProvidersSection {...state} />;
      case "self-hosted":
        return <SelfHostedSection {...state} />;
      case "custom-prompts":
        return <CustomPromptsSection {...state} />;
      case "website-access":
        return <WebsiteAccessSection {...state} />;
      case "appearance":
        return <AppearanceSection {...state} />;
      case "advanced":
        return <AdvancedSection {...state} />;
    }
  }

  return (
    <div className="pp:flex pp:overflow-hidden pp:h-dvh pp:w-dvw pp:bg-background pp:text-foreground">
      <aside
        className="pp:flex pp:w-64 pp:flex-col pp:justify-between pp:border-r pp:bg-card pp:p-4"
        id="pp-tour-sidebar"
      >
        <div className="pp:flex pp:flex-col pp:gap-5">
          <div className="pp:flex pp:items-center pp:gap-3 pp:px-2 pp:pt-2">
            <div className="pp:flex pp:h-8 pp:w-8 pp:items-center pp:justify-center pp:rounded-lg">
              <Logo />
            </div>
            <div className="pp:flex pp:flex-col">
              <span className="pp:font-bold pp:text-base pp:leading-tight pp:text-foreground">
                PromptPen
              </span>
              <span className="pp:font-normal pp:text-muted-foreground pp:text-xs">
                v{browser.runtime.getManifest().version}
              </span>
            </div>
          </div>

          <nav className="pp:flex pp:flex-col pp:gap-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const selected = state.activeSection === section.id;
              return (
                <button
                  className={cn(
                    "pp:flex pp:w-full pp:items-center pp:gap-3 pp:rounded-xl pp:px-3.5 pp:py-2.5 pp:font-medium pp:text-sm pp:transition-colors",
                    selected
                      ? "pp:bg-primary/10 pp:text-primary pp:font-semibold"
                      : "pp:text-muted-foreground hover:pp:bg-muted/60 hover:pp:text-foreground"
                  )}
                  id={`pp-tour-nav-${section.id}`}
                  key={section.id}
                  onClick={() => state.setActiveSection(section.id)}
                  type="button"
                >
                  <Icon className="pp:h-4 pp:w-4 pp:shrink-0" />
                  <span className="pp:flex-1 pp:text-left">
                    {section.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pp:space-y-3 pp:pt-2">
          <Separator className="pp:bg-border/60" />
          <button
            className="pp:flex pp:w-full pp:items-center pp:gap-3 pp:rounded-xl pp:p-2.5 pp:text-left pp:transition-colors hover:pp:bg-muted/60"
            onClick={() => setAboutOpen(true)}
            type="button"
          >
            <div className="pp:flex pp:h-9 pp:w-9 pp:items-center pp:justify-center pp:rounded-lg">
              <Logo />
            </div>
            <div className="pp:flex pp:min-w-0 pp:flex-1 pp:flex-col">
              <span className="pp:font-semibold pp:text-sm pp:text-foreground">
                About PromptPen
              </span>
              <span className="pp:truncate pp:text-muted-foreground pp:text-xs">
                v{browser.runtime.getManifest().version}
              </span>
            </div>
            <Info className="pp:h-4 pp:w-4 pp:text-muted-foreground/70" />
          </button>
        </div>
      </aside>

      <LazyMotion features={domAnimation}>
        <main className="pp:flex pp:flex-1 pp:flex-col">
          <AnimatePresence mode="wait">
            {state.loaded && (
              <m.div
                animate={{ opacity: 1, y: 0 }}
                className="pp:flex-1 pp:overflow-auto"
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                key={state.activeSection}
                transition={{ duration: 0.15 }}
              >
                {renderSection()}
              </m.div>
            )}
          </AnimatePresence>
          {!state.loaded && (
            <div className="pp:flex pp:flex-1 pp:items-center pp:justify-center">
              <Loader2 className="pp:h-6 pp:w-6 pp:animate-spin" />
            </div>
          )}
        </main>

        <AnimatePresence>
          {aboutOpen && (
            <m.div
              animate={{ opacity: 1 }}
              className="pp:fixed pp:inset-0 pp:z-50 pp:flex pp:items-center pp:justify-center"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <m.div
                aria-hidden="true"
                className="pp:absolute pp:inset-0 pp:bg-black/50"
                onClick={() => setAboutOpen(false)}
              />
              <m.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="pp:relative pp:flex pp:w-80 pp:flex-col pp:gap-5 pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-xl"
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="pp:flex pp:items-center pp:gap-3">
                  <div className="pp:flex pp:h-9 pp:w-9 pp:items-center pp:justify-center pp:rounded-lg">
                    <Logo />
                  </div>
                  <div>
                    <h2 className="pp:font-semibold pp:text-sm">PromptPen</h2>
                    <p className="pp:text-muted-foreground pp:text-xs">
                      v{browser.runtime.getManifest().version}
                    </p>
                  </div>
                </div>

                <p className="pp:text-muted-foreground pp:text-xs">
                  AI-powered writing assistant Chrome Extension.
                </p>

                <Separator />

                <div className="pp:flex pp:flex-col pp:gap-2">
                  <a
                    className="pp:flex pp:items-center pp:gap-2 pp:rounded-lg pp:px-3 pp:py-2 pp:text-muted-foreground pp:text-sm pp:transition-colors hover:pp:bg-accent hover:pp:text-accent-foreground"
                    href="https://github.com/officialpromptpen/promptpen"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Star className="pp:h-4 pp:w-4" />
                    Give us a star
                  </a>
                  <a
                    className="pp:flex pp:items-center pp:gap-2 pp:rounded-lg pp:px-3 pp:py-2 pp:text-muted-foreground pp:text-sm pp:transition-colors hover:pp:bg-accent hover:pp:text-accent-foreground"
                    href="https://github.com/officialpromptpen/promptpen/issues/new?labels=enhancement&template=feature_request.md"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Lightbulb className="pp:h-4 pp:w-4" />
                    Feature request
                  </a>
                  <a
                    className="pp:flex pp:items-center pp:gap-2 pp:rounded-lg pp:px-3 pp:py-2 pp:text-muted-foreground pp:text-sm pp:transition-colors hover:pp:bg-accent hover:pp:text-accent-foreground"
                    href="https://github.com/officialpromptpen/promptpen/issues/new"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Bug className="pp:h-4 pp:w-4" />
                    Report an issue
                  </a>
                  <a
                    className="pp:flex pp:items-center pp:gap-2 pp:rounded-lg pp:px-3 pp:py-2 pp:text-muted-foreground pp:text-sm pp:transition-colors hover:pp:bg-accent hover:pp:text-accent-foreground"
                    href="https://github.com/officialpromptpen/promptpen/discussions"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <MessagesSquare className="pp:h-4 pp:w-4" />
                    Discussions
                  </a>
                </div>

                <button
                  className="pp:rounded-lg pp:bg-primary pp:px-4 pp:py-2 pp:font-medium pp:text-primary-foreground pp:text-sm pp:transition-colors hover:pp:bg-primary/90"
                  onClick={() => setAboutOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}

export default IndexOptions;
