import { browser } from "wxt/browser"
import { LazyMotion, domAnimation, m } from "framer-motion"
import { Globe, Pen } from "lucide-react"
import { Layout } from "@/components/layout"
import { Navigation } from "@/components/navigation"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/features/theme/theme-toggle"
import { useActiveTab } from "@/hooks/use-active-tab"
import { StatusCard } from "./status-card"

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

function IndexPopup() {
  const { title, url, loading } = useActiveTab()

  return (
    <Layout>
      <LazyMotion features={domAnimation}>
        <m.div
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 mask-[linear-gradient(to_bottom,black_90%,transparent_100%)]"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
                <Pen className="size-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">PromptPen</span>
            </div>
            <div className="flex flex-row items-center gap-1">
              <p className="text-xs text-muted-foreground">v{browser.runtime.getManifest().version}</p>
              <ThemeToggle />
            </div>
          </header>

          <Separator />

          <m.div
            variants={item}
            className="flex items-center gap-3 rounded-md border bg-background/50 px-3 py-2"
          >
            <Globe className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                Current page
              </span>
              <span className="truncate text-xs text-foreground">
                {loading ? "Reading active page..." : title}
              </span>
            </div>
          </m.div>

          <Separator />

          <StatusCard url={url} />
        </m.div>
      </LazyMotion>
      <Navigation />
    </Layout>
  )
}

export default IndexPopup
