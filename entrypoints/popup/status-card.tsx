import { m } from "framer-motion";
import { Globe, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProviderDefinition } from "@/features/providers/registry";
import { getProviderSummary } from "@/features/providers/storage";
import {
  getHostnameFromUrl,
  isWebsiteEnabled,
  setWebsiteEnabled,
} from "@/features/storage/website-access";
import type { ProviderSummary, StatusCardProps } from "@/types";

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function StatusCard({ url }: StatusCardProps) {
  const [summary, setSummary] = useState<ProviderSummary | null>(null);
  const [isEnabledForCurrentSite, setIsEnabledForCurrentSite] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);

  const currentHostname = useMemo(() => getHostnameFromUrl(url), [url]);

  useEffect(() => {
    let mounted = true;

    async function readProviderSummary() {
      const providerSummary = await getProviderSummary();
      if (mounted) {
        setSummary(providerSummary);
      }
    }

    void readProviderSummary();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function readWebsiteAccess() {
      const enabled = currentHostname
        ? await isWebsiteEnabled(currentHostname)
        : false;

      if (!mounted) {
        return;
      }

      setIsEnabledForCurrentSite(enabled);
    }

    void readWebsiteAccess();

    return () => {
      mounted = false;
    };
  }, [currentHostname]);

  const defaultProvider = summary
    ? getProviderDefinition(summary.defaultProvider)
    : null;
  const hasConfiguredProvider = Boolean(summary?.configuredProviders.length);

  async function toggleCurrentWebsite() {
    if (!currentHostname) {
      return;
    }

    const nextState = !isEnabledForCurrentSite;
    await setWebsiteEnabled(currentHostname, nextState);
    setIsEnabledForCurrentSite(nextState);
    if (nextState) {
      setJustEnabled(true);
    }
  }

  return (
    <m.div className="pp:space-y-3" variants={item}>
      <Card className="pp:border-dashed" id="pp-tour-ai-status">
        <CardContent className="pp:p-3">
          <div className="pp:flex pp:items-center pp:gap-3">
            <div className="pp:flex pp:size-8 pp:shrink-0 pp:items-center pp:justify-center pp:rounded-full pp:bg-primary/10">
              <Sparkles
                aria-hidden="true"
                className="pp:size-4 pp:text-primary"
              />
            </div>

            <div className="pp:flex pp:flex-1 pp:flex-col pp:gap-0.5">
              <p className="pp:text-muted-foreground pp:text-xs">AI Provider</p>
              <p className="pp:font-medium pp:text-sm">
                {hasConfiguredProvider && defaultProvider
                  ? defaultProvider.label
                  : "Not configured"}
              </p>
            </div>

            <Badge className="pp:text-[10px]" variant="secondary">
              {summary ? summary.defaultModel : "Loading..."}
            </Badge>
          </div>

          {!hasConfiguredProvider && (
            <div className="pp:mt-2 pp:flex pp:items-center pp:gap-1.5 pp:rounded-md pp:border pp:border-destructive/40 pp:bg-destructive/10 pp:px-2 pp:py-1.5 pp:text-destructive pp:text-xs">
              <TriangleAlert
                aria-hidden="true"
                className="pp:size-3.5 pp:shrink-0"
              />
              <span>AI provider is not configured.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="pp:border-dashed" id="pp-tour-website-access">
        <CardContent className="pp:p-3">
          <div className="pp:flex pp:items-center pp:gap-2 pp:pb-2">
            <Globe
              aria-hidden="true"
              className="pp:size-4 pp:text-muted-foreground"
            />
            <span className="pp:font-semibold pp:text-foreground pp:text-xs">
              Website Access
            </span>
          </div>

          <div className="pp:flex pp:items-center pp:justify-between pp:rounded-md pp:border pp:bg-background pp:px-3 pp:py-2">
            <span className="pp:truncate pp:font-medium pp:text-foreground pp:text-xs">
              {currentHostname || "No active page"}
            </span>

            <button
              aria-checked={isEnabledForCurrentSite}
              aria-label={
                isEnabledForCurrentSite
                  ? "Disable for this site"
                  : "Enable for this site"
              }
              className={`pp:relative pp:inline-flex pp:h-6 pp:w-10 pp:shrink-0 pp:cursor-pointer pp:items-center pp:rounded-full pp:transition-colors pp:duration-200 pp:ease-in-out focus-visible:pp:outline-none focus-visible:pp:ring-2 focus-visible:pp:ring-ring focus-visible:pp:ring-offset-2 disabled:pp:cursor-not-allowed disabled:pp:opacity-50 ${isEnabledForCurrentSite ? "pp:bg-primary" : "pp:bg-muted-foreground/30"}
              `}
              disabled={!currentHostname}
              onClick={() => void toggleCurrentWebsite()}
              role="switch"
              type="button"
            >
              <span
                className={`pp:pointer-events-none pp:inline-block pp:size-5 pp:rounded-full pp:bg-background pp:shadow-sm pp:ring-0 pp:transition-transform pp:duration-200 pp:ease-in-out ${isEnabledForCurrentSite ? "pp:translate-x-4.5" : "pp:translate-x-0.5"}
                `}
              />
            </button>
          </div>

          {justEnabled && (
            <div className="pp:mt-2 pp:flex pp:items-center pp:gap-1.5 pp:rounded-md pp:border pp:border-primary/40 pp:bg-primary/10 pp:px-2 pp:py-1.5 pp:text-primary pp:text-xs">
              <RefreshCw
                aria-hidden="true"
                className="pp:size-3.5 pp:shrink-0"
              />
              <span>Reload the page to use the toolbar.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </m.div>
  );
}
