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
    env.useWasmCache = true;
    env.allowLocalModels = false;

    const base = browser.runtime.getURL("/onnx/" as PublicPath);
    if (base && env.backends.onnx?.wasm) {
      const execConfig = await getTransformersExecutionConfig();
      env.backends.onnx.wasm.proxy = execConfig.proxy;
      env.backends.onnx.wasm.numThreads = execConfig.numThreads;
      env.backends.onnx.wasm.wasmPaths = {
        mjs: `${base}ort-wasm-simd-threaded.asyncify.mjs`,
        wasm: `${base}ort-wasm-simd-threaded.asyncify.wasm`,
      };
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

  if (!accessToken) {
    env.fetch = baseFetch;
    return;
  }

  env.fetch = (input: string | URL, init?: Record<string, unknown>) => {
    const urlStr = typeof input === "string" ? input : input.toString();
    if (urlStr.includes("huggingface.co")) {
      const headers = new Headers(
        init?.headers as Record<string, string> | undefined
      );
      headers.set("Authorization", `Bearer ${accessToken}`);
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
          await configureAuth(config.accessToken);

          const { transformersJS } = await import(
            "@browser-ai/transformers-js"
          );

          const modelInstance = transformersJS(config.model, {
            device: "wasm",
          }) as unknown as LanguageModel & {
            doGenerate?: (...args: unknown[]) => Promise<unknown>;
            doStream?: (...args: unknown[]) => Promise<unknown>;
          };

          const originalDoGenerate =
            modelInstance.doGenerate?.bind(modelInstance);
          const originalDoStream = modelInstance.doStream?.bind(modelInstance);

          if (originalDoGenerate) {
            modelInstance.doGenerate = async (...args: unknown[]) => {
              await configureBackend();
              return originalDoGenerate(...args);
            };
          }

          if (originalDoStream) {
            modelInstance.doStream = async (...args: unknown[]) => {
              await configureBackend();
              return originalDoStream(...args);
            };
          }

          return modelInstance as LanguageModel;
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
          return "json";
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
