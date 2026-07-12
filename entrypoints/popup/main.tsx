import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "@/assets/tailwind.css"

async function init() {
  try {
    const result = await chrome.storage.local.get("theme")
    const theme = result.theme as string | undefined
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
