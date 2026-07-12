import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight, Loader2, Pen } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ThemeProvider } from "@/features/theme/theme-provider"
import { cn } from "@/lib/utils"
import { useOptionsState } from "./hooks/use-options-state"
import { AdvancedSection } from "./sections/advanced"
import { AIProvidersSection } from "./sections/ai-providers"
import { AppearanceSection } from "./sections/appearance"
import { GeneralSection } from "./sections/general"
import { ModelsSection } from "./sections/models"
import { PrivacySection } from "./sections/privacy"
import { ShortcutsSection } from "./sections/shortcuts"
import { WebsiteAccessSection } from "./sections/website-access"
import { WritingSection } from "./sections/writing"
import { sections } from "./types"

function IndexOptions() {
  const state = useOptionsState()

  function renderSection() {
    switch (state.activeSection) {
      case "general":
        return <GeneralSection {...state} />
      case "ai-providers":
        return <AIProvidersSection {...state} />
      case "models":
        return <ModelsSection {...state} />
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
      <div className="flex h-dvh w-dvw bg-background text-foreground">
        <aside className="flex w-60 flex-col border-r bg-card">
          <div className="flex h-14 items-center gap-2 px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Pen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">PromptPen</span>
          </div>

          <Separator />

          <div className="flex-1 overflow-y-auto px-2 py-3">
            <nav className="flex flex-col gap-1">
              {sections.map((section) => {
                const Icon = section.icon
                const selected = state.activeSection === section.id
                return (
                  <button
                    type="button"
                    key={section.id}
                    onClick={() => state.setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{section.label}</span>
                    {selected && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  </button>
                )
              })}
            </nav>
          </div>

          <Separator />

          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">
              PromptPen v{chrome.runtime.getManifest().version}
            </p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          {state.loaded ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={state.activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-auto"
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default IndexOptions
