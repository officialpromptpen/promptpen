import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { initTheme } from "@/features/theme/init-theme";
import App from "./App.tsx";
import "@/assets/tailwind.css";
import { TooltipProvider } from "@/components/ui/tooltip";

void initTheme();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>
);
