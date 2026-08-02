import React from "react";
import ReactDOM from "react-dom/client";
import { initTheme } from "@/features/theme/init-theme";
import App from "./App.tsx";
import "@/assets/tailwind.css";

void initTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
