import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { storage } from "@wxt-dev/storage";
import type { SectionId } from "@/types";

export type TourStep = "popup" | "dashboard" | "done";

const TOUR_KEY = "promptpen.tour.v1";

export async function getTourStep(): Promise<TourStep> {
  const step = await storage.getItem<TourStep>(`local:${TOUR_KEY}`);
  return step ?? "popup";
}

export async function setTourStep(step: TourStep): Promise<void> {
  await storage.setItem(`local:${TOUR_KEY}`, step);
}

export async function startPopupTour() {
  if (import.meta.env.DEV) {
    return;
  }

  const step = await getTourStep();
  if (step !== "popup") {
    return;
  }

  const driverObj = driver({
    animate: true,
    onDestroyed: () => {
      void setTourStep("dashboard");
    },
    overlayColor: "oklch(0 0 0 / 0.4)",
    showProgress: true,
    steps: [
      {
        element: "#pp-tour-theme-toggle",
        popover: {
          align: "start",
          description:
            "Toggle between light and dark mode to match your preference.",
          side: "bottom",
          title: "Switch Theme",
        },
      },
      {
        element: "#pp-tour-ai-status",
        popover: {
          align: "center",
          description:
            "This shows your configured AI provider. If it says 'Not configured', open the Dashboard to set one up.",
          side: "top",
          title: "AI Provider Status",
        },
      },
      {
        element: "#pp-tour-website-access",
        popover: {
          align: "center",
          description:
            "Enable or disable PromptPen on the current website. Toggle it on to use the toolbar after selecting text.",
          side: "top",
          title: "Website Access",
        },
      },
      {
        element: "#pp-tour-dashboard-btn",
        popover: {
          align: "center",
          description:
            "Click Home to open the full Dashboard where you can configure AI providers, custom prompts, and more.",
          side: "top",
          title: "Open Dashboard",
        },
      },
    ],
  });

  driverObj.drive();
}

export function startDashboardTour(onNavigate: (sectionId: SectionId) => void) {
  if (import.meta.env.DEV) {
    return;
  }

  const driverObj = driver({
    animate: true,
    onDestroyed: () => {
      void setTourStep("done");
    },
    overlayColor: "oklch(0 0 0 / 0.5)",
    showProgress: true,
    steps: [
      {
        element: "#pp-tour-sidebar",
        popover: {
          align: "center",
          description:
            "This is where you configure PromptPen. The sidebar has all the sections — let's start with AI Providers.",
          side: "right",
          title: "Dashboard",
        },
      },
      {
        element: "#pp-tour-nav-ai-providers",
        onHighlighted: () => {
          onNavigate("ai-providers");
        },
        popover: {
          align: "start",
          description:
            "Click here to add your provider. You'll need an API key and model name from your provider (e.g. OpenRouter, OpenAI).",
          side: "right",
          title: "AI Providers",
        },
      },
      {
        element: "#pp-tour-provider-list",
        popover: {
          align: "start",
          description:
            "Choose a provider from the list. For example, OpenRouter lets you access many models through one API key.",
          side: "right",
          title: "Select a Provider",
        },
      },
      {
        element: "#pp-tour-model-field",
        popover: {
          align: "start",
          description:
            "Type your model name. For example, if using OpenRouter, you might use 'openai/gpt-4o'.",
          side: "left",
          title: "Enter Model",
        },
      },
      {
        element: "#pp-tour-api-key-field",
        popover: {
          align: "start",
          description:
            "Type your API key. For example, if using OpenRouter, you might use 'or-xxxx'.",
          side: "left",
          title: "Enter API Key",
        },
      },
      {
        element: "#pp-tour-test-btn",
        popover: {
          align: "start",
          description:
            "After Adding API key next click on test connection button to verify if the provider is working correctly.",
          side: "left",
          title: "Test Provider",
        },
      },
      {
        element: "#pp-tour-save-btn",
        popover: {
          align: "start",
          description:
            "After testing, click Save. Your provider is now configured and ready to use.",
          side: "left",
          title: "Test and Save",
        },
      },
    ],
  });

  driverObj.drive();
}
