import type { FirefoxDataCollectionPermissions } from "wxt";
import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    browser_specific_settings: {
      gecko: {
        data_collection_permissions: {
          required: ["none"],
        } satisfies FirefoxDataCollectionPermissions,
        id: "promptpen@frontendweb.agency",
      },
    },
    description: "AI-powered writing assistant",
    host_permissions: ["<all_urls>"],
    name: "PromptPen",
    permissions: ["storage", "activeTab"],
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["onnx/*"],
      },
    ],
  },
  modules: ["@wxt-dev/module-react"],

  vite: () => ({
    build: {
      chunkSizeWarningLimit: 7000,
      rolldownOptions: {
        checks: {
          pluginTimings: false,
        },
      },
      sourcemap: false,
    },
    define: {
      "import.meta": {},
    },
  }),
});
