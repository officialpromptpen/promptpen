import { browser } from "wxt/browser"
import { useEffect, useState } from "react"

interface ActiveTabState {
  title: string
  url: string
  loading: boolean
}

const FALLBACK_TITLE = "No active page"

export function useActiveTab(): ActiveTabState {
  const [state, setState] = useState<ActiveTabState>({
    title: FALLBACK_TITLE,
    url: "",
    loading: true,
  })

  useEffect(() => {
    let mounted = true

    async function readActiveTab() {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true })
        const tab = tabs[0]
        if (!mounted) {
          return
        }

        setState({
          title: tab?.title?.trim() || FALLBACK_TITLE,
          url: tab?.url || "",
          loading: false,
        })
      } catch {
        if (mounted) {
          setState({ title: FALLBACK_TITLE, url: "", loading: false })
        }
      }
    }

    void readActiveTab()

    return () => {
      mounted = false
    }
  }, [])

  return state
}
