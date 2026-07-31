import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { storage } from "@wxt-dev/storage"
import type { SectionId } from "@/types"

export type TourStep = "popup" | "dashboard" | "done"

const TOUR_KEY = "promptpen.tour.v1"

export async function getTourStep(): Promise<TourStep> {
  const step = await storage.getItem<TourStep>(`local:${TOUR_KEY}`)
  return step ?? "popup"
}

export async function setTourStep(step: TourStep): Promise<void> {
  await storage.setItem(`local:${TOUR_KEY}`, step)
}

export async function startPopupTour() {
  if (import.meta.env.DEV) return

  const step = await getTourStep()
  if (step !== "popup") return

  const driverObj = driver({
    animate: true,
    showProgress: true,
    overlayColor: "oklch(0 0 0 / 0.4)",
    steps: [
      {
        element: "#pp-tour-theme-toggle",
        popover: {
          title: "Switch Theme",
          description:
            "Toggle between light and dark mode to match your preference.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#pp-tour-ai-status",
        popover: {
          title: "AI Provider Status",
          description:
            "This shows your configured AI provider. If it says 'Not configured', open the Dashboard to set one up.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#pp-tour-website-access",
        popover: {
          title: "Website Access",
          description:
            "Enable or disable PromptPen on the current website. Toggle it on to use the toolbar after selecting text.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#pp-tour-dashboard-btn",
        popover: {
          title: "Open Dashboard",
          description:
            "Click Home to open the full Dashboard where you can configure AI providers, custom prompts, and more.",
          side: "top",
          align: "center",
        },
      },
    ],
    onDestroyed: () => {
      void setTourStep("dashboard")
    },
  })

  driverObj.drive()
}

export function startDashboardTour(onNavigate: (sectionId: SectionId) => void) {
  if (import.meta.env.DEV) return

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: "oklch(0 0 0 / 0.5)",
    steps: [
      {
        element: "#pp-tour-sidebar",
        popover: {
          title: "Dashboard",
          description:
            "This is where you configure PromptPen. The sidebar has all the sections — let's start with AI Providers.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#pp-tour-nav-ai-providers",
        popover: {
          title: "AI Providers",
          description:
            "Click here to add your provider. You'll need an API key and model name from your provider (e.g. OpenRouter, OpenAI).",
          side: "right",
          align: "start",
        },
        onHighlighted: () => {
          onNavigate("ai-providers")
        },
      },
      {
        element: "#pp-tour-provider-list",
        popover: {
          title: "Select a Provider",
          description:
            "Choose a provider from the list. For example, OpenRouter lets you access many models through one API key.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#pp-tour-model-field",
        popover: {
          title: "Enter Model",
          description:
            "Type your model name. For example, if using OpenRouter, you might use 'openai/gpt-4o'.",
          side: "left",
          align: "start",
        },
      },
       {
        element: "#pp-tour-api-key-field",
        popover: {
          title: "Enter API Key",
          description:
            "Type your API key. For example, if using OpenRouter, you might use 'or-xxxx'.",
          side: "left",
          align: "start",
        },
      },
       {
        element: "#pp-tour-test-btn",
        popover: {
          title: "Test Provider",
          description:
            "After Adding API key next click on test connection button to verify if the provider is working correctly.",
          side: "left",
          align: "start",
        },
      },
      {
        element: "#pp-tour-save-btn",
        popover: {
          title: "Test and Save",
          description:
            "After testing, click Save. Your provider is now configured and ready to use.",
          side: "left",
          align: "start",
        },
      },
    ],
    onDestroyed: () => {
      void setTourStep("done")
    },
  })

  driverObj.drive()
}
