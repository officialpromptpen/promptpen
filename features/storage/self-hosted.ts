import { storage } from "@wxt-dev/storage";

const STORAGE_KEY = "promptpen.self-hosted.v1";

export interface StoredTransformersModel {
  addedAt: number;
  downloadProgress: number;
  label: string;
  modelId: string;
  status: "not-downloaded" | "downloading" | "ready" | "error";
}

interface StoredSelfHostedState {
  transformersModels: StoredTransformersModel[];
}

const DEFAULT_TRANSFORMERS_MODELS: StoredTransformersModel[] = [
  {
    addedAt: Date.now(),
    downloadProgress: 0,
    label: "SmolLM2-135M-Instruct-ONNX-MHA",
    modelId: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA",
    status: "not-downloaded",
  },
];

async function readState(): Promise<StoredSelfHostedState> {
  const state = await storage.getItem<StoredSelfHostedState>(
    `local:${STORAGE_KEY}`
  );
  if (state?.transformersModels) {
    return state;
  }
  return { transformersModels: DEFAULT_TRANSFORMERS_MODELS };
}

async function writeState(state: StoredSelfHostedState): Promise<void> {
  await storage.setItem(`local:${STORAGE_KEY}`, state);
}

export async function getTransformersModels(): Promise<
  StoredTransformersModel[]
> {
  const state = await readState();
  return state.transformersModels;
}

export async function addTransformersModel(
  modelId: string,
  label?: string
): Promise<StoredTransformersModel[]> {
  const state = await readState();
  const exists = state.transformersModels.some((m) => m.modelId === modelId);
  if (exists) {
    return state.transformersModels;
  }

  state.transformersModels.push({
    addedAt: Date.now(),
    downloadProgress: 0,
    label: label ?? modelId.split("/").pop() ?? modelId,
    modelId,
    status: "not-downloaded",
  });

  await writeState(state);
  return state.transformersModels;
}

export async function removeTransformersModel(
  modelId: string
): Promise<StoredTransformersModel[]> {
  const state = await readState();
  state.transformersModels = state.transformersModels.filter(
    (m) => m.modelId !== modelId
  );
  await writeState(state);
  return state.transformersModels;
}

export async function updateTransformersModelStatus(
  modelId: string,
  status: StoredTransformersModel["status"],
  downloadProgress?: number
): Promise<void> {
  const state = await readState();
  const model = state.transformersModels.find((m) => m.modelId === modelId);
  if (model) {
    model.status = status;
    if (downloadProgress !== undefined) {
      model.downloadProgress = downloadProgress;
    }
    await writeState(state);
  }
}

export interface SystemRequirements {
  cpuCores: number;
  deviceMemory: number | null;
  issues: string[];
  meetsMinimum: boolean;
  wasm: boolean;
  wasmSimd: boolean;
  webgpu: boolean;
}

export function checkSystemRequirements(): SystemRequirements {
  const wasm = !!(typeof WebAssembly !== "undefined" && WebAssembly.validate);
  let wasmSimd = false;
  if (wasm) {
    try {
      const simdModule = new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10,
        1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
      ]);
      wasmSimd = WebAssembly.validate(simdModule);
    } catch {
      wasmSimd = false;
    }
  }

  const webgpu = "gpu" in navigator && navigator.gpu !== undefined;
  const cpuCores = navigator.hardwareConcurrency || 0;
  const deviceMemory =
    "deviceMemory" in navigator
      ? (navigator as unknown as { deviceMemory: number }).deviceMemory
      : null;

  const issues: string[] = [];

  if (!wasm) {
    issues.push(
      "WebAssembly is not supported. Transformers.js requires WebAssembly to run."
    );
  }
  if (cpuCores < 2) {
    issues.push(
      "Your CPU may be too slow. At least 2 CPU cores are recommended."
    );
  }
  if (deviceMemory !== null && deviceMemory < 2) {
    issues.push(
      `Only ${deviceMemory}GB of RAM detected. At least 2GB is recommended for small models.`
    );
  }

  return {
    cpuCores,
    deviceMemory,
    issues,
    meetsMinimum: issues.length === 0,
    wasm,
    wasmSimd,
    webgpu,
  };
}
