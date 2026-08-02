import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import {
  Bug,
  ChevronRight,
  Info,
  Lightbulb,
  Loader2,
  Star,
  MessagesSquare
} from "lucide-react";
import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
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
        return <SelfHostedSection />;
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
    <div className="pp:flex pp:h-dvh pp:w-dvw pp:bg-background pp:text-foreground">
      <aside
        className="pp:flex pp:w-60 pp:flex-col pp:border-r pp:bg-card"
        id="pp-tour-sidebar"
      >
        <div className="pp:flex pp:h-14 pp:items-center pp:gap-2 pp:px-5">
          <div className="pp:flex pp:h-8 pp:w-8 pp:items-center pp:justify-center pp:rounded-lg">
            <Logo />
          </div>
          <span className="pp:font-semibold pp:text-sm">PromptPen</span>
        </div>

        <Separator />

        <div className="pp:flex-1 pp:overflow-y-auto pp:px-2 pp:py-3">
          <nav className="pp:flex pp:flex-col pp:gap-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const selected = state.activeSection === section.id;
              return (
                <button
                  className={cn(
                    "pp:flex pp:items-center pp:gap-3 pp:rounded-lg pp:px-3 pp:py-2 pp:font-medium pp:text-sm pp:transition-colors",
                    selected
                      ? "pp:bg-accent pp:text-accent-foreground"
                      : "pp:text-muted-foreground hover:pp:bg-accent/50 hover:pp:text-accent-foreground"
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
                  {selected && (
                    <ChevronRight className="pp:h-3.5 pp:w-3.5 pp:text-muted-foreground/60" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pp:border-t pp:px-2 pp:py-1">
          <Button
            className="pp:h-auto pp:w-full pp:rounded-none pp:px-3 pp:py-3 pp:text-left"
            onClick={() => setAboutOpen(true)}
            type="button"
            variant="ghost"
          >
            <div className="pp:flex pp:h-9 pp:w-9 pp:shrink-0 pp:items-center pp:justify-center pp:rounded-full pp:border pp:border-border/70 pp:bg-background/70 pp:shadow-inner">
              <Info className="pp:h-4 pp:w-4" />
            </div>
            <div
              aria-hidden="true"
              className="pp:h-8 pp:w-px pp:bg-border/70"
            />
            <div className="pp:flex pp:min-w-0 pp:flex-1 pp:flex-col pp:items-start pp:gap-0.5">
              <span className="pp:font-semibold pp:text-base pp:leading-none">
                About
              </span>
              <p className="pp:text-muted-foreground pp:text-xs">
                PromptPen v{browser.runtime.getManifest().version}
              </p>
            </div>
            <ChevronRight className="pp:h-5 pp:w-5 pp:text-muted-foreground/80" />
          </Button>
        </div>
      </aside>

      <LazyMotion features={domAnimation}>
        <main className="pp:flex pp:flex-1 pp:flex-col pp:overflow-hidden">
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
