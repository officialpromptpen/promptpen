import { transformersJS } from "@browser-ai/transformers-js";
import { env } from "@huggingface/transformers";
import type { LanguageModel } from "ai";
import type { ProviderModule } from "../_types";
import { getTransformersExecutionConfig } from "@/features/storage/self-hosted";
import { RECOMMENDED_MODELS } from "./recommended-models";
import { browser } from "wxt/browser"

env.useWasmCache = false;
env.allowLocalModels = false;

async function configureBackend(): Promise<void> {
  const base = browser.runtime.getURL("/onnx/" as any);
  if (base && env.backends.onnx?.wasm) {
    env.backends.onnx.wasm.wasmPaths = {
      mjs: `${base}ort-wasm-simd-threaded.asyncify.mjs`,
      wasm: `${base}ort-wasm-simd-threaded.asyncify.wasm`,
    };
    const execConfig = await getTransformersExecutionConfig();
    env.backends.onnx.wasm.proxy = execConfig.proxy;
    env.backends.onnx.wasm.numThreads = execConfig.numThreads;
  }
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
    void configureBackend();
    configureAuth(config.accessToken);

    const model = transformersJS(config.model, {
      device: "wasm",
    });

    return model as unknown as LanguageModel;
  },
  defaultModel: RECOMMENDED_MODELS[0].modelId,
  id: "transformers",
  label: "Transformers.js",
};
