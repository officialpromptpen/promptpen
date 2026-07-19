import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  manifest: {
    name: "PromptPen Beta",
    description: "PromptPen Beta — AI-powered writing assistant",
    permissions: ["storage", "activeTab", "contextMenus"],
    host_permissions: ["<all_urls>"],
    browser_specific_settings: {
      gecko: {
        id: "promptpen@example.com",
      },
    },
  },
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
    build: {
      sourcemap: false,
    },
  }),
  suppressWarnings: {
    firefoxDataCollection: true,
  },
})
