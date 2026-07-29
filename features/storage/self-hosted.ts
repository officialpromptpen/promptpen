import { storage } from "@wxt-dev/storage"

const STORAGE_KEY = "promptpen.self-hosted.v1"

export interface StoredTransformersModel {
  modelId: string
  label: string
  addedAt: number
  status: "not-downloaded" | "downloading" | "ready" | "error"
  downloadProgress: number
}

interface StoredSelfHostedState {
  transformersModels: StoredTransformersModel[]
}

const DEFAULT_TRANSFORMERS_MODELS: StoredTransformersModel[] = [
  {
    modelId: "Xenova/Qwen2-0.5B-Instruct",
    label: "Qwen2-0.5B-Instruct",
    addedAt: Date.now(),
    status: "not-downloaded",
    downloadProgress: 0,
  },
]

async function readState(): Promise<StoredSelfHostedState> {
  const state = await storage.getItem<StoredSelfHostedState>(`local:${STORAGE_KEY}`)
  if (state?.transformersModels) {
    return state
  }
  return { transformersModels: DEFAULT_TRANSFORMERS_MODELS }
}

async function writeState(state: StoredSelfHostedState): Promise<void> {
  await storage.setItem(`local:${STORAGE_KEY}`, state)
}

export async function getTransformersModels(): Promise<StoredTransformersModel[]> {
  const state = await readState()
  return state.transformersModels
}

export async function addTransformersModel(
  modelId: string,
  label?: string,
): Promise<StoredTransformersModel[]> {
  const state = await readState()
  const exists = state.transformersModels.some((m) => m.modelId === modelId)
  if (exists) {
    return state.transformersModels
  }

  state.transformersModels.push({
    modelId,
    label: label ?? modelId.split("/").pop() ?? modelId,
    addedAt: Date.now(),
    status: "not-downloaded",
    downloadProgress: 0,
  })

  await writeState(state)
  return state.transformersModels
}

export async function removeTransformersModel(modelId: string): Promise<StoredTransformersModel[]> {
  const state = await readState()
  state.transformersModels = state.transformersModels.filter((m) => m.modelId !== modelId)
  await writeState(state)
  return state.transformersModels
}

export async function updateTransformersModelStatus(
  modelId: string,
  status: StoredTransformersModel["status"],
  downloadProgress?: number,
): Promise<void> {
  const state = await readState()
  const model = state.transformersModels.find((m) => m.modelId === modelId)
  if (model) {
    model.status = status
    if (downloadProgress !== undefined) {
      model.downloadProgress = downloadProgress
    }
    await writeState(state)
  }
}

export async function setTransformersModels(
  models: StoredTransformersModel[],
): Promise<void> {
  await writeState({ transformersModels: models })
}
