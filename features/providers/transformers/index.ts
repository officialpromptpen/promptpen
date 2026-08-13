import type { LanguageModel } from "ai";
import type { PublicPath } from "wxt/browser";
import { browser } from "wxt/browser";
import { getTransformersExecutionConfig } from "@/features/storage/self-hosted";
import type { ProviderModule } from "../_types";
import { RECOMMENDED_MODELS } from "./recommended-models";

let backendConfiguredPromise: Promise<void> | null = null;
let originalEnvFetch: unknown = null;

async function configureBackend(): Promise<void> {
  if (backendConfiguredPromise) {
    return backendConfiguredPromise;
  }

  backendConfiguredPromise = (async () => {
    const { env } = await import("@huggingface/transformers");
    env.useWasmCache = false;
    env.allowLocalModels = false;

    const base = browser.runtime.getURL("/onnx/" as PublicPath);
    if (base && env.backends.onnx?.wasm) {
      const execConfig = await getTransformersExecutionConfig();
      env.backends.onnx.wasm.proxy = execConfig.proxy;
      env.backends.onnx.wasm.numThreads = execConfig.numThreads;
      env.backends.onnx.wasm.wasmPaths = base;
    }
  })();

  return backendConfiguredPromise;
}

async function configureAuth(accessToken?: string): Promise<void> {
  const { env } = await import("@huggingface/transformers");

  if (!originalEnvFetch) {
    originalEnvFetch = env.fetch;
  }

  const baseFetch = originalEnvFetch as typeof env.fetch;
  const token = accessToken?.trim();

  env.fetch = async (
    input: string | URL,
    init?: Record<string, unknown>
  ) => {
    const urlStr = typeof input === "string" ? input : input.toString();

    // Delegate remote model asset downloads to background script to bypass webpage CSP/CORS
    if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
      try {
        const response = (await browser.runtime.sendMessage({
          customPrompt: token ?? undefined,
          prompt: urlStr,
          type: "FETCH_REMOTE_ASSET",
        })) as {
          ok?: boolean;
          bytes?: number[];
          headers?: Record<string, string>;
          status?: number;
        };

        if (response && response.ok && Array.isArray(response.bytes)) {
          const uint8 = new Uint8Array(response.bytes);
          return new Response(uint8.buffer, {
            headers: new Headers(response.headers ?? {}),
            status: response.status ?? 200,
          });
        }
      } catch {
        // Fall back to direct fetch if messaging is unavailable
      }
    }

    const isHfApiOrRepo =
      urlStr.includes("huggingface.co") &&
      !urlStr.includes("cdn-lfs.huggingface.co") &&
      !urlStr.includes("cdn-lfs.hf.co");

    if (token && isHfApiOrRepo) {
      const headers = new Headers(
        init?.headers as Record<string, string> | undefined
      );
      headers.set("Authorization", `Bearer ${token}`);
      return baseFetch(input, { ...init, headers });
    }
    return baseFetch(input, init);
  };
}

export type { RecommendedModel } from "./recommended-models";

export const provider: ProviderModule = {
  category: "self-hosted",
  createModel: (config) => {
    const g = globalThis as unknown as {
      ServiceWorkerGlobalScope?: new () => unknown;
    };
    if (
      typeof g.ServiceWorkerGlobalScope !== "undefined" &&
      g.ServiceWorkerGlobalScope &&
      self instanceof g.ServiceWorkerGlobalScope
    ) {
      throw new Error(
        "TransformersJS in-browser models cannot run inside Chrome Extension Service Worker because dynamic WASM import() is disallowed by W3C HTML spec. Run TransformersJS in the window context."
      );
    }

    let modelPromise: Promise<LanguageModel> | null = null;

    const getOrInitModel = async (): Promise<LanguageModel> => {
      if (!modelPromise) {
        modelPromise = (async () => {
          await configureBackend();
          await configureAuth(config.accessToken);

          const { transformersJS } = await import(
            "@browser-ai/transformers-js"
          );

          const modelInstance = transformersJS(config.model, {
            device: "wasm",
            dtype: "q4",
          }) as unknown as LanguageModel;

          return modelInstance;
        })();
      }
      return modelPromise;
    };

    return new Proxy({} as Record<string, unknown>, {
      get(_target, prop) {
        if (prop === "specificationVersion") {
          return "v2";
        }
        if (prop === "provider") {
          return "transformers";
        }
        if (prop === "modelId") {
          return config.model;
        }
        if (prop === "defaultObjectGenerationMode") {
          return undefined;
        }

        if (prop === "doGenerate") {
          return async (...args: unknown[]) => {
            const model = await getOrInitModel();
            const gen = (
              model as unknown as {
                doGenerate: (...a: unknown[]) => Promise<unknown>;
              }
            ).doGenerate;
            return gen.call(model, ...args);
          };
        }
        if (prop === "doStream") {
          return async (...args: unknown[]) => {
            const model = await getOrInitModel();
            const strm = (
              model as unknown as {
                doStream: (...a: unknown[]) => Promise<unknown>;
              }
            ).doStream;
            return strm.call(model, ...args);
          };
        }
      },
    }) as unknown as LanguageModel;
  },
  defaultModel: RECOMMENDED_MODELS[0]?.modelId ?? "",
  id: "transformers",
  label: "Transformers.js",
};
