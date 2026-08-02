import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { initTheme } from "@/features/theme/init-theme";
import App from "./App.tsx";
import "@/assets/tailwind.css";

void initTheme();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
