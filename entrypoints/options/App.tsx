import { browser } from "wxt/browser"
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion"
import { ChevronRight, Loader2, Pen } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ThemeProvider } from "@/features/theme/theme-provider"
import { cn } from "@/lib/utils"
import { useOptionsState } from "./hooks/use-options-state"
import { AdvancedSection } from "./sections/advanced"
import { AIProvidersSection } from "./sections/ai-providers"
import { AppearanceSection } from "./sections/appearance"
import { GeneralSection } from "./sections/general"
import { PrivacySection } from "./sections/privacy"
import { ShortcutsSection } from "./sections/shortcuts"
import { WebsiteAccessSection } from "./sections/website-access"
import { WritingSection } from "./sections/writing"
import { sections } from "@/constants/options"

function IndexOptions() {
  const state = useOptionsState()

  function renderSection() {
    switch (state.activeSection) {
      case "general":
        return <GeneralSection {...state} />
      case "ai-providers":
        return <AIProvidersSection {...state} />
      case "writing":
        return <WritingSection {...state} />
      case "privacy":
        return <PrivacySection {...state} />
      case "website-access":
        return <WebsiteAccessSection {...state} />
      case "shortcuts":
        return <ShortcutsSection {...state} />
      case "appearance":
        return <AppearanceSection {...state} />
      case "advanced":
        return <AdvancedSection {...state} />
    }
  }

  return (
    <ThemeProvider defaultTheme={state.settings.theme}>
      <div className="pp:flex pp:h-dvh pp:w-dvw pp:bg-background pp:text-foreground">
        <aside className="pp:flex pp:w-60 pp:flex-col pp:border-r pp:bg-card">
          <div className="pp:flex pp:h-14 pp:items-center pp:gap-2 pp:px-5">
            <div className="pp:flex pp:h-8 pp:w-8 pp:items-center pp:justify-center pp:rounded-lg pp:bg-primary">
              <Pen className="pp:h-4 pp:w-4 pp:text-primary-foreground" />
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

          <Separator />

          <div className="pp:px-4 pp:py-3">
            <p className="pp:text-xs pp:text-muted-foreground">
              PromptPen v{browser.runtime.getManifest().version}
            </p>
          </div>
        </aside>

        <LazyMotion features={domAnimation}>
          <main className="pp:flex pp:flex-1 pp:flex-col pp:overflow-hidden">
            {state.loaded ? (
              <AnimatePresence mode="wait">
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
              </AnimatePresence>
            ) : (
              <div className="pp:flex pp:flex-1 pp:items-center pp:justify-center">
                <Loader2 className="pp:h-6 pp:w-6 pp:animate-spin" />
              </div>
            )}
          </main>
        </LazyMotion>
      </div>
    </ThemeProvider>
  )
}

export default IndexOptions
