import { defineConfig } from "wxt"
import type { FirefoxDataCollectionPermissions } from "wxt"

export default defineConfig({
  manifest: {
    name: "PromptPen Beta",
    description: "PromptPen Beta — AI-powered writing assistant",
    permissions: ["storage", "activeTab", "contextMenus"],
    host_permissions: ["<all_urls>"],
    browser_specific_settings: {
      gecko: {
        id: "promptpen@frontendweb.agency",
        data_collection_permissions: {
          required: ["none"],
        } satisfies FirefoxDataCollectionPermissions,
      },
    },
  },
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    build: {
      sourcemap: false,
    },
  }),
})
