import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import type { ActiveTabState } from "@/types";

const FALLBACK_TITLE = "No active page";

export function useActiveTab(): ActiveTabState {
  const [state, setState] = useState<ActiveTabState>({
    loading: true,
    title: FALLBACK_TITLE,
    url: "",
  });

  useEffect(() => {
    let mounted = true;

    async function readActiveTab() {
      try {
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        const tab = tabs[0];
        if (!mounted) {
          return;
        }

        setState({
          loading: false,
          title: tab?.title?.trim() || FALLBACK_TITLE,
          url: tab?.url || "",
        });
      } catch {
        if (mounted) {
          setState({ loading: false, title: FALLBACK_TITLE, url: "" });
        }
      }
    }

    void readActiveTab();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
