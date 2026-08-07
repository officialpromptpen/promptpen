import { transformersJS } from "@browser-ai/transformers-js";
import { env } from "@huggingface/transformers";
import type { LanguageModel } from "ai";
import type { ProviderModule } from "../_types";
import { getTransformersExecutionConfig } from "@/features/storage/self-hosted";
import { RECOMMENDED_MODELS } from "./recommended-models";
import { browser } from "wxt/browser"

env.useWasmCache = false;
env.allowLocalModels = false;

let backendConfiguredPromise: Promise<void> | null = null;

async function configureBackend(): Promise<void> {
  if (backendConfiguredPromise) {
    return backendConfiguredPromise;
  }

  backendConfiguredPromise = (async () => {
    const base = browser.runtime.getURL("/onnx/" as any);
    if (base && env.backends.onnx?.wasm) {
      const execConfig = await getTransformersExecutionConfig();
      env.backends.onnx.wasm.proxy = execConfig.proxy;
      env.backends.onnx.wasm.numThreads = execConfig.numThreads;

      if (!env.backends.onnx.wasm.wasmBinary) {
        try {
          const wasmUrl = `${base}ort-wasm-simd-threaded.asyncify.wasm`;
          const res = await fetch(wasmUrl);
          if (res.ok) {
            const buffer = await res.arrayBuffer();
            env.backends.onnx.wasm.wasmBinary = new Uint8Array(buffer);
          }
        } catch (e) {
          console.warn("Failed to pre-fetch ONNX WASM binary:", e);
        }
      }
    }
  })();

  return backendConfiguredPromise;
}

function configureAuth(accessToken?: string): void {
  if (!accessToken) {
    return;
  }

  const originalFetch = env.fetch;
  env.fetch = (input: string | URL, init?: Record<string, unknown>) => {
    const headers = new Headers(
      init?.headers as Record<string, string> | undefined
    );
    headers.set("Authorization", `Bearer ${accessToken}`);
    return originalFetch(input, { ...init, headers });
  };
}

export type { RecommendedModel } from "./recommended-models";
export { RECOMMENDED_MODELS } from "./recommended-models";

export const provider: ProviderModule = {
  category: "self-hosted",
  createModel: (config) => {
    configureAuth(config.accessToken);

    const modelInstance = transformersJS(config.model, {
      device: "wasm",
    });

    const model = modelInstance as unknown as LanguageModel & {
      doGenerate?: (...args: unknown[]) => Promise<unknown>;
      doStream?: (...args: unknown[]) => Promise<unknown>;
    };

    const originalDoGenerate = model.doGenerate?.bind(model);
    const originalDoStream = model.doStream?.bind(model);

    if (originalDoGenerate) {
      model.doGenerate = async (...args: unknown[]) => {
        await configureBackend();
        return originalDoGenerate(...args);
      };
    }

    if (originalDoStream) {
      model.doStream = async (...args: unknown[]) => {
        await configureBackend();
        return originalDoStream(...args);
      };
    }

    return model as LanguageModel;
  },
  defaultModel: RECOMMENDED_MODELS[0].modelId,
  id: "transformers",
  label: "Transformers.js",
};
