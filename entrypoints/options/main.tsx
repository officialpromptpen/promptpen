import React from "react"
import ReactDOM from "react-dom/client"
import { storage } from "@wxt-dev/storage"
import App from "./App.tsx"
import "@/assets/tailwind.css"

async function init() {
  try {
    const theme = await storage.getItem<string>("local:theme")
    if (theme && !localStorage.getItem("promptpen-theme")) {
      localStorage.setItem("promptpen-theme", theme)
    }
  } catch {}

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

void init()
