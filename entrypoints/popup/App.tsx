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
          className="pp:flex pp:flex-1 pp:flex-col pp:gap-4 pp:overflow-y-auto pp:p-4 pp:mask-[linear-gradient(to_bottom,black_90%,transparent_100%)]"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <header className="pp:flex pp:items-center pp:justify-between">
            <div className="pp:flex pp:items-center pp:gap-2">
              <div className="pp:flex pp:size-7 pp:items-center pp:justify-center pp:rounded-lg pp:bg-primary">
                <Pen className="pp:size-4 pp:text-primary-foreground" />
              </div>
              <span className="pp:text-sm pp:font-semibold">PromptPen</span>
            </div>
            <div className="pp:flex pp:flex-row pp:items-center pp:gap-1">
              <p className="pp:text-xs pp:text-muted-foreground">v{browser.runtime.getManifest().version}</p>
              <ThemeToggle />
            </div>
          </header>

          <Separator />

          <m.div
            variants={item}
            className="pp:flex pp:items-center pp:gap-3 pp:rounded-md pp:border pp:bg-background/50 pp:px-3 pp:py-2"
          >
            <Globe className="pp:size-5 pp:shrink-0 pp:text-muted-foreground" aria-hidden="true" />
            <div className="pp:flex pp:flex-col pp:gap-2 pp:min-w-0">
              <span className="pp:text-[10px] pp:font-medium pp:text-muted-foreground pp:uppercase pp:tracking-tight">
                Current page
              </span>
              <span className="pp:truncate pp:text-xs pp:text-foreground">
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
