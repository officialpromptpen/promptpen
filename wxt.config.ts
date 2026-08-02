import { defineConfig } from "wxt"
import type { FirefoxDataCollectionPermissions } from "wxt"

export default defineConfig({
  manifest: {
    name: "PromptPen",
    description: "AI-powered writing assistant",
    permissions: ["storage", "activeTab"],
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["onnx/*"],
        matches: ["<all_urls>"],
      },
    ],
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
    define: {
      "import.meta": {},
    },
  }),
})
