import { motion } from "framer-motion"
import { Globe, Sparkles, TriangleAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getProviderDefinition } from "@/features/providers/catalog"
import { getProviderSummary, type ProviderSummary } from "@/features/providers/storage"
import {
  getHostnameFromUrl,
  isWebsiteEnabled,
  setWebsiteEnabled,
} from "@/features/storage/website-access"

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

interface StatusCardProps {
  url: string
}

export function StatusCard({ url }: StatusCardProps) {
  const [summary, setSummary] = useState<ProviderSummary | null>(null)
  const [isEnabledForCurrentSite, setIsEnabledForCurrentSite] = useState(false)

  const currentHostname = useMemo(() => getHostnameFromUrl(url), [url])

  useEffect(() => {
    let mounted = true

    async function readProviderSummary() {
      const providerSummary = await getProviderSummary()
      if (mounted) {
        setSummary(providerSummary)
      }
    }

    void readProviderSummary()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function readWebsiteAccess() {
      const enabled = currentHostname ? await isWebsiteEnabled(currentHostname) : false

      if (!mounted) {
        return
      }

      setIsEnabledForCurrentSite(enabled)
    }

    void readWebsiteAccess()

    return () => {
      mounted = false
    }
  }, [currentHostname])

  const defaultProvider = summary ? getProviderDefinition(summary.defaultProvider) : null
  const hasConfiguredProvider = Boolean(summary?.configuredProviders.length)

  async function toggleCurrentWebsite() {
    if (!currentHostname) {
      return
    }

    const nextState = !isEnabledForCurrentSite
    await setWebsiteEnabled(currentHostname, nextState)
    setIsEnabledForCurrentSite(nextState)
  }

  return (
    <motion.div variants={item} className="space-y-3">
      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">AI Provider</p>
              <p className="text-sm font-medium">
                {hasConfiguredProvider && defaultProvider
                  ? defaultProvider.label
                  : "Not configured"}
              </p>
            </div>

            <Badge variant="secondary" className="text-[10px]">
              {summary ? summary.defaultModel : "Loading..."}
            </Badge>
          </div>

          {!hasConfiguredProvider && (
            <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs text-destructive flex items-center gap-1.5">
              <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
              <span>AI provider is not configured.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 pb-2">
            <Globe className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground">Website Access</span>
          </div>

          <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <span className="truncate text-xs font-medium text-foreground">
              {currentHostname || "No active page"}
            </span>

            <button
              type="button"
              onClick={() => void toggleCurrentWebsite()}
              disabled={!currentHostname}
              className={`
                relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full
                transition-colors duration-200 ease-in-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-50
                ${isEnabledForCurrentSite ? "bg-primary" : "bg-muted-foreground/30"}
              `}
              role="switch"
              aria-checked={isEnabledForCurrentSite}
              aria-label={
                isEnabledForCurrentSite ? "Disable for this site" : "Enable for this site"
              }
            >
              <span
                className={`
                  pointer-events-none inline-block size-5 rounded-full bg-background shadow-sm ring-0
                  transition-transform duration-200 ease-in-out
                  ${isEnabledForCurrentSite ? "translate-x-4.5" : "translate-x-0.5"}
                `}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
