import { browser } from "wxt/browser"
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion"
import { useEffect, useState } from "react"
import { Bug, ChevronRight, Info, Loader2, Star, Lightbulb } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useOptionsState } from "./hooks/use-options-state"
import { AdvancedSection } from "./sections/advanced"
import { AIProvidersSection } from "./sections/ai-providers"
import { AppearanceSection } from "./sections/appearance"
import { CustomPromptsSection } from "./sections/custom-prompts"
import { GeneralSection } from "./sections/general"
import { SelfHostedSection } from "./sections/self-hosted"
import { WebsiteAccessSection } from "./sections/website-access"
import { sections } from "@/constants/options"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { getTourStep, startDashboardTour } from "@/features/onboarding/tour"


function IndexOptions() {
  const state = useOptionsState()
  const [aboutOpen, setAboutOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    async function maybeStartTour() {
      const step = await getTourStep()
      if (!mounted || step !== "dashboard") return
      startDashboardTour(state.setActiveSection)
    }

    void maybeStartTour()

    return () => {
      mounted = false
    }
  }, [state.setActiveSection])

  function renderSection() {
    switch (state.activeSection) {
      case "general":
        return <GeneralSection {...state} />
      case "ai-providers":
        return <AIProvidersSection {...state} />
      case "self-hosted":
        return <SelfHostedSection />
      case "custom-prompts":
        return <CustomPromptsSection {...state} />
      case "website-access":
        return <WebsiteAccessSection {...state} />
      case "appearance":
        return <AppearanceSection {...state} />
      case "advanced":
        return <AdvancedSection {...state} />
    }
  }

  return (
    <div className="pp:flex pp:h-dvh pp:w-dvw pp:bg-background pp:text-foreground">
        <aside id="pp-tour-sidebar" className="pp:flex pp:w-60 pp:flex-col pp:border-r pp:bg-card">
          <div className="pp:flex pp:h-14 pp:items-center pp:gap-2 pp:px-5">
            <div className="pp:flex pp:h-8 pp:w-8 pp:items-center pp:justify-center pp:rounded-lg">
              <Logo />            
            </div>
            <span className="pp:text-sm pp:font-semibold">PromptPen</span>
          </div>

          <Separator />

          <div className="pp:flex-1 pp:overflow-y-auto pp:px-2 pp:py-3">
            <nav className="pp:flex pp:flex-col pp:gap-1">
              {sections.map((section) => {
                const Icon = section.icon
                const selected = state.activeSection === section.id
                return (
                  <button
                    type="button"
                    key={section.id}
                    id={`pp-tour-nav-${section.id}`}
                    onClick={() => state.setActiveSection(section.id)}
                    className={cn(
                      "pp:flex pp:items-center pp:gap-3 pp:rounded-lg pp:px-3 pp:py-2 pp:text-sm pp:font-medium pp:transition-colors",
                      selected
                        ? "pp:bg-accent pp:text-accent-foreground"
                        : "pp:text-muted-foreground hover:pp:bg-accent/50 hover:pp:text-accent-foreground",
                    )}
                  >
                    <Icon className="pp:h-4 pp:w-4 pp:shrink-0" />
                    <span className="pp:flex-1 pp:text-left">{section.label}</span>
                    {selected && <ChevronRight className="pp:h-3.5 pp:w-3.5 pp:text-muted-foreground/60" />}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="pp:border-t pp:px-2 pp:py-1">
            <Button
              type="button"
              onClick={() => setAboutOpen(true)}
              variant="ghost"
              className="pp:h-auto pp:w-full pp:rounded-none pp:px-3 pp:py-3 pp:text-left"
            >
              <div className="pp:flex pp:h-9 pp:w-9 pp:shrink-0 pp:items-center pp:justify-center pp:rounded-full pp:border pp:border-border/70 pp:bg-background/70 pp:shadow-inner">
                <Info className="pp:h-4 pp:w-4" />
              </div>
              <div className="pp:h-8 pp:w-px pp:bg-border/70" aria-hidden="true" />
              <div className="pp:flex pp:min-w-0 pp:flex-1 pp:flex-col pp:items-start pp:gap-0.5">
                <span className="pp:text-base pp:font-semibold pp:leading-none">About</span>
                <p className="pp:text-xs pp:text-muted-foreground">
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
                  key={state.activeSection}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="pp:flex-1 pp:overflow-auto"
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
                className="pp:fixed pp:inset-0 pp:z-50 pp:flex pp:items-center pp:justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <m.div
                  className="pp:absolute pp:inset-0 pp:bg-black/50"
                  onClick={() => setAboutOpen(false)}
                  aria-hidden="true"
                />
                <m.div
                  className="pp:relative pp:flex pp:w-80 pp:flex-col pp:gap-5 pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-xl"
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="pp:flex pp:items-center pp:gap-3">
                    <div className="pp:flex pp:h-9 pp:w-9 pp:items-center pp:justify-center pp:rounded-lg">
                      <Logo />
                    </div>
                    <div>
                      <h2 className="pp:text-sm pp:font-semibold">PromptPen</h2>
                      <p className="pp:text-xs pp:text-muted-foreground">
                        v{browser.runtime.getManifest().version}
                      </p>
                    </div>
                  </div>

                  <p className="pp:text-xs pp:text-muted-foreground">
                    AI-powered writing assistant Chrome Extension.
                  </p>

                  <Separator />

                  <div className="pp:flex pp:flex-col pp:gap-2">
                    <a
                      href="https://github.com/officialpromptpen/promptpen"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pp:flex pp:items-center pp:gap-2 pp:rounded-lg pp:px-3 pp:py-2 pp:text-sm pp:text-muted-foreground pp:transition-colors hover:pp:bg-accent hover:pp:text-accent-foreground"
                    >
                      <Star className="pp:h-4 pp:w-4" />
                      Give us a star
                    </a>
                    <a
                      href="https://github.com/officialpromptpen/promptpen/issues/new?labels=enhancement&template=feature_request.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pp:flex pp:items-center pp:gap-2 pp:rounded-lg pp:px-3 pp:py-2 pp:text-sm pp:text-muted-foreground pp:transition-colors hover:pp:bg-accent hover:pp:text-accent-foreground"
                    >
                      <Lightbulb className="pp:h-4 pp:w-4" />
                      Feature request
                    </a>
                    <a
                      href="https://github.com/officialpromptpen/promptpen/issues/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pp:flex pp:items-center pp:gap-2 pp:rounded-lg pp:px-3 pp:py-2 pp:text-sm pp:text-muted-foreground pp:transition-colors hover:pp:bg-accent hover:pp:text-accent-foreground"
                    >
                      <Bug className="pp:h-4 pp:w-4" />
                      Report an issue
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAboutOpen(false)}
                    className="pp:rounded-lg pp:bg-primary pp:px-4 pp:py-2 pp:text-sm pp:font-medium pp:text-primary-foreground pp:transition-colors hover:pp:bg-primary/90"
                  >
                    Close
                  </button>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>
        </LazyMotion>
    </div>
  )
}

export default IndexOptions
