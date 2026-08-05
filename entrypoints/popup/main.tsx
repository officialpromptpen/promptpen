import React from "react";
import ReactDOM from "react-dom/client";
import { initTheme } from "@/features/theme/init-theme";
import App from "./App.tsx";
import "@/assets/tailwind.css";
import { TooltipProvider } from "@/components/ui/tooltip";

void initTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </React.StrictMode>
);
