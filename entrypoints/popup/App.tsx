import { domAnimation, LazyMotion, m } from "framer-motion";
import { Globe } from "lucide-react";
import { useEffect } from "react";
import { browser } from "wxt/browser";
import { Logo } from "@/components/Logo";
import { Layout } from "@/components/layout";
import { Navigation } from "@/components/navigation";
import { Separator } from "@/components/ui/separator";
import { startPopupTour } from "@/features/onboarding/tour";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { useActiveTab } from "@/hooks/use-active-tab";
import { StatusCard } from "./status-card";

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

function IndexPopup() {
  const { title, url, loading } = useActiveTab();

  useEffect(() => {
    void startPopupTour();
  }, []);

  return (
    <Layout>
      <LazyMotion features={domAnimation}>
        <m.div
          animate="show"
          className="pp:mask-[linear-gradient(to_bottom,black_90%,transparent_100%)] pp:flex pp:flex-1 pp:flex-col pp:gap-4 pp:overflow-y-hidden pp:p-4"
          initial="hidden"
          variants={container}
        >
          <header className="pp:flex pp:items-center pp:justify-between">
            <div className="pp:flex pp:items-center pp:gap-2">
              <div className="pp:flex pp:size-7 pp:items-center pp:justify-center pp:rounded-lg">
                <Logo />
              </div>
              <span className="pp:font-semibold pp:text-sm">PromptPen</span>
            </div>

            <div className="pp:flex pp:items-center pp:gap-1">
              <span id="pp-tour-theme-toggle">
                <ThemeToggle />
              </span>
              <p className="pp:text-muted-foreground pp:text-xs">
                v{browser.runtime.getManifest().version}
              </p>
            </div>
          </header>

          <Separator />

          <m.div
            className="pp:flex pp:items-center pp:gap-3 pp:rounded-md pp:border pp:bg-background/50 pp:px-3 pp:py-2"
            variants={item}
          >
            <Globe
              aria-hidden="true"
              className="pp:size-5 pp:shrink-0 pp:text-muted-foreground"
            />
            <div className="pp:flex pp:min-w-0 pp:flex-col pp:gap-2">
              <span className="pp:font-medium pp:text-[10px] pp:text-muted-foreground pp:uppercase pp:tracking-tight">
                Current page
              </span>
              <span className="pp:truncate pp:text-foreground pp:text-xs">
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
  );
}

export default IndexPopup;
