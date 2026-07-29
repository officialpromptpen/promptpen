import { useEffect, useState } from "react"
import { Loader2, Trash2, Download, RefreshCw, Plus, CheckCircle2, TriangleAlert, Server, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { testProviderConnectionWithValues } from "@/features/providers/sdk"
import {
  getDecryptedApiKey,
  getProviderEditorState,
  saveProviderConfig,
  removeProviderConfig,
} from "@/features/providers/storage"
import {
  getTransformersModels,
  addTransformersModel,
  removeTransformersModel,
  setTransformersModels,
  updateTransformersModelStatus,
} from "@/features/storage/self-hosted"
import type { StoredTransformersModel } from "@/features/storage/self-hosted"

type OllamaStatus = "idle" | "testing" | "success" | "error"
type DownloadState = Record<string, { status: "idle" | "downloading" | "ready" | "error"; progress: number }>

export function SelfHostedSection() {
  // ── Ollama state ──
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState("http://localhost:11434/v1")
  const [ollamaModel, setOllamaModel] = useState("llama3.1")
  const [ollamaApiKey, setOllamaApiKey] = useState("")
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>("idle")
  const [ollamaMessage, setOllamaMessage] = useState("")
  const [ollamaConfigured, setOllamaConfigured] = useState(false)

  // ── Transformers state ──
  const [transformersModels, setTransformersModelsState] = useState<StoredTransformersModel[]>([])
  const [newModelId, setNewModelId] = useState("")
  const [downloadStates, setDownloadStates] = useState<DownloadState>({})

  useEffect(() => {
    async function init() {
      const editorState = await getProviderEditorState("ollama")
      setOllamaModel(editorState.model)
      setOllamaConfigured(editorState.hasApiKey)

      const storedKey = await getDecryptedApiKey("ollama")
      if (storedKey) {
        setOllamaApiKey(storedKey)
      }

      const models = await getTransformersModels()
      setTransformersModelsState(models)

      const initialDownloadStates: DownloadState = {}
      for (const model of models) {
        initialDownloadStates[model.modelId] = {
          status: model.status === "ready" ? "ready" : "idle",
          progress: model.downloadProgress,
        }
      }
      setDownloadStates(initialDownloadStates)
    }
    void init()
  }, [])

  async function handleOllamaTest() {
    setOllamaStatus("testing")
    setOllamaMessage("")

    let resolvedApiKey = ollamaApiKey.trim()
    if (!resolvedApiKey && ollamaConfigured) {
      const storedKey = await getDecryptedApiKey("ollama")
      if (storedKey) resolvedApiKey = storedKey
    }

    try {
      const result = await testProviderConnectionWithValues(
        "ollama",
        ollamaModel.trim(),
        resolvedApiKey,
        ollamaBaseUrl.trim(),
      )
      if (result.ok) {
        setOllamaStatus("success")
        setOllamaMessage("Connection successful.")
      } else {
        setOllamaStatus("error")
        setOllamaMessage(`Connection failed. ${result.message ?? "Unknown error."}`)
      }
    } catch {
      setOllamaStatus("error")
      setOllamaMessage("Connection test failed unexpectedly.")
    }
  }

  async function handleOllamaSave() {
    await saveProviderConfig("ollama", ollamaModel.trim(), ollamaApiKey.trim(), ollamaBaseUrl.trim())
    setOllamaConfigured(true)
    setOllamaStatus("success")
    setOllamaMessage("Ollama settings saved.")
  }

  async function handleOllamaDelete() {
    await removeProviderConfig("ollama")
    setOllamaConfigured(false)
    setOllamaApiKey("")
    setOllamaStatus("idle")
    setOllamaMessage("")
  }

  async function handleAddTransformersModel() {
    const trimmed = newModelId.trim()
    if (!trimmed) return

    const models = await addTransformersModel(trimmed)
    setTransformersModelsState(models)
    setDownloadStates((prev) => ({ ...prev, [trimmed]: { status: "idle", progress: 0 } }))
    setNewModelId("")
  }

  async function handleDownloadModel(modelId: string) {
    setDownloadStates((prev) => ({ ...prev, [modelId]: { status: "downloading", progress: 0 } }))
    await updateTransformersModelStatus(modelId, "downloading", 0)

    try {
      const { pipeline, env } = await import("@huggingface/transformers")
      env.allowRemoteModels = true
      env.allowLocalModels = false

      await pipeline("text-generation", modelId, {
        dtype: "q4",
        progress_callback: (progress: { status: string; progress?: number; loaded?: number; total?: number }) => {
          if (progress.status === "progress" && progress.progress !== undefined) {
            const pct = Math.round(progress.progress)
            setDownloadStates((prev) => ({ ...prev, [modelId]: { status: "downloading", progress: pct } }))
            void updateTransformersModelStatus(modelId, "downloading", pct)
          } else if (progress.status === "progress_total" && progress.loaded !== undefined && progress.total !== undefined) {
            const pct = Math.round((progress.loaded / progress.total) * 100)
            setDownloadStates((prev) => ({ ...prev, [modelId]: { status: "downloading", progress: pct } }))
            void updateTransformersModelStatus(modelId, "downloading", pct)
          }
        },
      })

      setDownloadStates((prev) => ({ ...prev, [modelId]: { status: "ready", progress: 100 } }))
      await updateTransformersModelStatus(modelId, "ready", 100)
    } catch {
      setDownloadStates((prev) => ({ ...prev, [modelId]: { status: "error", progress: 0 } }))
      await updateTransformersModelStatus(modelId, "error")
    }
  }

  async function handleClearModelCache(modelId: string) {
    try {
      const cache = await caches.open("transformers-cache")
      const requests = await cache.keys()
      const matching = requests.filter((r) => r.url.includes(encodeURIComponent(modelId)))
      await Promise.all(matching.map((r) => cache.delete(r)))
    } catch {
      // Cache API might not be available
    }

    setDownloadStates((prev) => ({ ...prev, [modelId]: { status: "idle", progress: 0 } }))
    await updateTransformersModelStatus(modelId, "not-downloaded", 0)
  }

  async function handleRemoveTransformersModel(modelId: string) {
    await handleClearModelCache(modelId)
    const models = await removeTransformersModel(modelId)
    setTransformersModelsState(models)
    setDownloadStates((prev) => {
      const next = { ...prev }
      delete next[modelId]
      return next
    })
  }

  return (
    <div className="pp:mx-auto pp:max-w-4xl pp:space-y-8 pp:px-8 pp:py-8">
      <div>
        <h1 className="pp:text-2xl pp:font-semibold pp:tracking-tight">Self-Hosted</h1>
        <p className="pp:mt-1 pp:text-sm pp:text-muted-foreground">
          Manage local and in-browser AI models.
        </p>
      </div>

      {/* ── Ollama ── */}
      <div className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
        <div className="pp:mb-4 pp:flex pp:items-center pp:gap-3">
          <Server className="pp:size-5 pp:text-muted-foreground" />
          <div>
            <h2 className="pp:text-lg pp:font-semibold">Ollama</h2>
            <p className="pp:text-sm pp:text-muted-foreground">
              Run models locally via Ollama.
            </p>
          </div>
        </div>

        <div className="pp:grid pp:gap-4 sm:pp:grid-cols-2">
          <label className="pp:space-y-1.5">
            <span className="pp:text-sm pp:font-medium">Base URL</span>
            <input
              value={ollamaBaseUrl}
              onChange={(e) => setOllamaBaseUrl(e.target.value)}
              className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
              placeholder="http://localhost:11434/v1"
            />
          </label>
          <label className="pp:space-y-1.5">
            <span className="pp:text-sm pp:font-medium">Model</span>
            <input
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
              placeholder="llama3.1"
            />
          </label>
        </div>

        <label className="pp:mt-4 pp:block pp:space-y-1.5">
          <span className="pp:text-sm pp:font-medium">
            API Key <span className="pp:text-muted-foreground">(optional for Ollama)</span>
          </span>
          <input
            type="password"
            value={ollamaApiKey}
            onChange={(e) => setOllamaApiKey(e.target.value)}
            className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
            placeholder={ollamaConfigured ? "Leave empty to keep existing key" : "Paste your API key"}
          />
        </label>

        <div className="pp:mt-4 pp:flex pp:flex-wrap pp:items-center pp:gap-3">
          <Button onClick={handleOllamaTest} disabled={ollamaStatus === "testing"} variant="outline" className="pp:gap-2">
            {ollamaStatus === "testing" && <Loader2 className="pp:size-4 pp:animate-spin" />}
            Test connection
          </Button>
          <Button onClick={handleOllamaSave} className="pp:gap-2">
            Save
          </Button>
          {ollamaConfigured && (
            <Button onClick={handleOllamaDelete} variant="destructive" className="pp:gap-2">
              <Trash2 className="pp:size-4" />
              Delete
            </Button>
          )}
        </div>

        {ollamaStatus !== "idle" && ollamaMessage && (
          <div
            className={`pp:mt-4 pp:flex pp:items-center pp:gap-2 pp:rounded-md pp:border pp:px-3 pp:py-2 pp:text-sm ${
              ollamaStatus === "success"
                ? "pp:border-green-500/30 pp:bg-green-500/10 pp:text-green-700"
                : "pp:border-destructive/40 pp:bg-destructive/10 pp:text-destructive"
            }`}
          >
            {ollamaStatus === "success" ? (
              <CheckCircle2 className="pp:size-4 pp:shrink-0" />
            ) : (
              <TriangleAlert className="pp:size-4 pp:shrink-0" />
            )}
            <span>{ollamaMessage}</span>
          </div>
        )}
      </div>

      {/* ── Transformers.js ── */}
      <div className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
        <div className="pp:mb-4 pp:flex pp:items-center pp:gap-3">
          <Cpu className="pp:size-5 pp:text-muted-foreground" />
          <div>
            <h2 className="pp:text-lg pp:font-semibold">Transformers.js</h2>
            <p className="pp:text-sm pp:text-muted-foreground">
              In-browser AI models powered by Transformers.js and ONNX Runtime.
            </p>
          </div>
        </div>

        <div className="pp:mb-4 pp:flex pp:items-center pp:gap-2">
          <input
            value={newModelId}
            onChange={(e) => setNewModelId(e.target.value)}
            className="pp:h-9 pp:flex-1 pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
            placeholder="Add Hugging Face model ID (e.g., Xenova/Qwen2-0.5B-Instruct)"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTransformersModel()
            }}
          />
          <Button onClick={handleAddTransformersModel} className="pp:gap-2 pp:shrink-0">
            <Plus className="pp:size-4" />
            Add
          </Button>
        </div>

        {transformersModels.length === 0 ? (
          <p className="pp:py-8 pp:text-center pp:text-sm pp:text-muted-foreground">
            No models added yet. Add a Hugging Face model ID above to get started.
          </p>
        ) : (
          <div className="pp:space-y-2">
            {transformersModels.map((model) => {
              const dl = downloadStates[model.modelId] ?? { status: "idle", progress: 0 }

              return (
                <div
                  key={model.modelId}
                  className="pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:px-4 pp:py-3"
                >
                  <div className="pp:flex pp:min-w-0 pp:flex-1 pp:flex-col pp:gap-1">
                    <div className="pp:flex pp:items-center pp:gap-2">
                      <span className="pp:text-sm pp:font-medium">{model.label}</span>
                      <StatusBadge status={dl.status} />
                    </div>
                    <span className="pp:truncate pp:text-xs pp:text-muted-foreground">
                      {model.modelId}
                    </span>
                    {dl.status === "downloading" && (
                      <div className="pp:mt-1 pp:h-1.5 pp:w-full pp:overflow-hidden pp:rounded-full pp:bg-muted">
                        <div
                          className="pp:h-full pp:rounded-full pp:bg-primary pp:transition-all"
                          style={{ width: `${dl.progress}%` }}
                        />
                      </div>
                    )}
                    {dl.status === "downloading" && (
                      <span className="pp:text-xs pp:text-muted-foreground">
                        Downloading... {dl.progress}%
                      </span>
                    )}
                  </div>

                  <div className="pp:flex pp:items-center pp:gap-1.5 pp:shrink-0 pp:ml-2">
                    {(dl.status === "idle" || dl.status === "error") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadModel(model.modelId)}
                        className="pp:gap-1.5"
                      >
                        <Download className="pp:size-3.5" />
                        Download
                      </Button>
                    )}
                    {dl.status === "downloading" && (
                      <Button variant="outline" size="sm" disabled className="pp:gap-1.5">
                        <Loader2 className="pp:size-3.5 pp:animate-spin" />
                        Downloading
                      </Button>
                    )}
                    {dl.status === "ready" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearModelCache(model.modelId)}
                          className="pp:gap-1.5"
                        >
                          <RefreshCw className="pp:size-3.5" />
                          Redownload
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTransformersModel(model.modelId)}
                      aria-label={`Remove ${model.label}`}
                    >
                      <Trash2 className="pp:size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    idle: "pp:bg-muted pp:text-muted-foreground",
    downloading: "pp:bg-blue-500/10 pp:text-blue-600 pp:border-blue-500/30",
    ready: "pp:bg-green-500/10 pp:text-green-600 pp:border-green-500/30",
    error: "pp:bg-destructive/10 pp:text-destructive pp:border-destructive/40",
  }

  const labels: Record<string, string> = {
    idle: "Not downloaded",
    downloading: "Downloading",
    ready: "Ready",
    error: "Error",
  }

  return (
    <span
      className={`pp:rounded-full pp:border pp:px-2 pp:py-0.5 pp:text-[10px] pp:font-medium ${styles[status] ?? styles.idle}`}
    >
      {labels[status] ?? status}
    </span>
  )
}
