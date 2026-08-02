import { transformersJS } from "@browser-ai/transformers-js";
import { env } from "@huggingface/transformers";
import type { LanguageModel } from "ai";
import type { ProviderModule } from "../_types";
import { RECOMMENDED_MODELS } from "./recommended-models";

function configureBackend(): void {
  const base = globalThis.chrome?.runtime?.getURL("onnx/");
  if (base && env.backends.onnx?.wasm) {
    env.backends.onnx.wasm.wasmPaths = {
      mjs: `${base}ort-wasm-simd-threaded.asyncify.mjs`,
      wasm: `${base}ort-wasm-simd-threaded.asyncify.wasm`,
    };
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
    configureBackend();
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
