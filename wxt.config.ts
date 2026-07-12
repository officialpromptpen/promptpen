import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  manifest: {
    name: "PromptPen",
    description: "AI-powered writing assistant",
    version: "0.0.0",
    permissions: ["storage", "activeTab", "contextMenus"],
    host_permissions: ["<all_urls>"],
  },
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
})
