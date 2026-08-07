import {
  CheckCircle2,
  Cpu,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Server,
  Sliders,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { testProviderConnectionWithValues } from "@/features/providers/sdk";
import {
  getDecryptedAccessToken,
  getDecryptedApiKey,
  getProviderEditorState,
  recordProviderConnectionTest,
  removeProviderConfig,
  saveProviderConfig,
} from "@/features/providers/storage";
import { RECOMMENDED_MODELS } from "@/features/providers/transformers/recommended-models";
import type {
  StoredTransformersModel,
  SystemRequirements,
} from "@/features/storage/self-hosted";
import {
  addTransformersModel,
  checkSystemRequirements,
  getTransformersExecutionConfig,
  getTransformersModels,
  removeTransformersModel,
  setTransformersExecutionConfig,
  updateTransformersModelStatus,
} from "@/features/storage/self-hosted";
import type { AIProvider, OptionsState } from "@/types";
import { ConfiguredProvidersList } from "./ai-providers/configured-providers-list";
import { HuggingFaceTokenSection } from "./self-hosted/hugging-face-token-section";
import { SettingsSectionLayout } from "./shared/section-shell";

type OllamaStatus = "error" | "idle" | "success" | "testing";
interface ModelDownloadState {
  errorMessage?: string;
  progress: number;
  status: "downloading" | "error" | "idle" | "ready" | "validating";
}
type DownloadState = Record<string, ModelDownloadState>;

const STATUS_BADGE_STYLES: Record<string, string> = {
  downloading: "pp:bg-blue-500/10 pp:text-blue-600 pp:border-blue-500/30",
  error: "pp:bg-destructive/10 pp:text-destructive pp:border-destructive/40",
  idle: "pp:bg-muted pp:text-muted-foreground",
  ready: "pp:bg-green-500/10 pp:text-green-600 pp:border-green-500/30",
  validating: "pp:bg-amber-500/10 pp:text-amber-600 pp:border-amber-500/30",
};

const STATUS_BADGE_LABELS: Record<string, string> = {
  downloading: "Downloading",
  error: "Error",
  idle: "Not downloaded",
  ready: "Ready",
  validating: "Validating",
};

export function SelfHostedSection(state?: OptionsState) {
  const ollamaDetails = useMemo(() => {
    if (!state?.configuredProviderDetails) {
      return [];
    }
    return state.configuredProviderDetails.filter(
      (detail) => detail.provider === "ollama"
    );
  }, [state?.configuredProviderDetails]);

  const transformersDetails = useMemo(() => {
    if (!state?.configuredProviderDetails) {
      return [];
    }
    return state.configuredProviderDetails.filter(
      (detail) => detail.provider === "transformers"
    );
  }, [state?.configuredProviderDetails]);

  async function handleRetryConnection(provider: AIProvider) {
    if (!state) {
      return;
    }
    const editorState = await getProviderEditorState(provider);
    const apiKey = (await getDecryptedApiKey(provider)) ?? "";
    const result = await testProviderConnectionWithValues(
      provider,
      editorState.model,
      apiKey
    );
    await recordProviderConnectionTest(provider, result.ok);
    await state.refreshProviderData();
  }

  function handleEdit(provider: AIProvider) {
    if (state) {
      state.handleEditProvider(provider);
    }
    const cardId = provider === "ollama" ? "ollama-card" : "transformers-card";
    const element = document.getElementById(cardId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <SettingsSectionLayout
      description="Manage local Ollama and in-browser Transformers.js model routing."
      title="Self-Hosted Configuration"
    >
      <div className="pp:space-y-8">
        <div className="pp:space-y-4">
          <OllamaCard onSaved={state?.refreshProviderData} />
          {state && ollamaDetails.length > 0 && (
            <ConfiguredProvidersList
              configuredProviderDetails={ollamaDetails}
              handleDeleteProvider={async (provider, model) => {
                await state.handleDeleteProvider(provider, model);
                await state.refreshProviderData();
              }}
              handleEditProvider={handleEdit}
              onRetryConnection={handleRetryConnection}
              selectedProvider={state.selectedProvider}
              title="Ollama Active Connections"
            />
          )}
        </div>

        <div className="pp:space-y-4">
          <TransformersCard onSaved={state?.refreshProviderData} />
          {state && transformersDetails.length > 0 && (
            <ConfiguredProvidersList
              configuredProviderDetails={transformersDetails}
              handleDeleteProvider={async (provider, model) => {
                await state.handleDeleteProvider(provider, model);
                await state.refreshProviderData();
              }}
              handleEditProvider={handleEdit}
              onRetryConnection={handleRetryConnection}
              selectedProvider={state.selectedProvider}
              title="Transformers.js Active Connections"
            />
          )}
        </div>
      </div>
    </SettingsSectionLayout>
  );
}

function OllamaCard({ onSaved }: { onSaved?: () => void }) {
  const form = useForm<{
    apiKey: string;
    baseUrl: string;
    model: string;
  }>({
    defaultValues: {
      apiKey: "",
      baseUrl: "http://localhost:11434/v1",
      model: "llama3.1",
    },
  });
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>("idle");
  const [ollamaMessage, setOllamaMessage] = useState("");
  const [ollamaConfigured, setOllamaConfigured] = useState(false);

  useEffect(() => {
    async function init() {
      const editorState = await getProviderEditorState("ollama");
      const storedKey = await getDecryptedApiKey("ollama");

      form.reset({
        apiKey: storedKey ?? "",
        baseUrl: "http://localhost:11434/v1",
        model: editorState.model,
      });
      setOllamaConfigured(editorState.hasApiKey);
    }
    void init();
  }, [form]);

  async function handleOllamaTest(values: {
    apiKey: string;
    baseUrl: string;
    model: string;
  }) {
    setOllamaStatus("testing");
    setOllamaMessage("");

    let resolvedApiKey = values.apiKey.trim();
    if (!resolvedApiKey && ollamaConfigured) {
      const storedKey = await getDecryptedApiKey("ollama");
      if (storedKey) {
        resolvedApiKey = storedKey;
      }
    }

    try {
      const result = await testProviderConnectionWithValues(
        "ollama",
        values.model.trim(),
        resolvedApiKey,
        values.baseUrl.trim()
      );
      if (result.ok) {
        setOllamaStatus("success");
        setOllamaMessage("Connection successful.");
      } else {
        setOllamaStatus("error");
        const rawMessage = result.message ?? "Unknown error.";
        const isForbidden = rawMessage.toLowerCase().includes("forbidden");
        setOllamaMessage(
          `Connection failed. ${rawMessage}${
            isForbidden
              ? ' (Ollama blocks cross-origin extension requests by default. Set OLLAMA_ORIGINS="*" in your system/Ollama environment).'
              : ""
          }`
        );
      }
    } catch {
      setOllamaStatus("error");
      setOllamaMessage("Connection test failed unexpectedly.");
    }
  }

  async function handleOllamaSave(values: {
    apiKey: string;
    baseUrl: string;
    model: string;
  }) {
    await saveProviderConfig(
      "ollama",
      values.model.trim(),
      values.apiKey.trim(),
      values.baseUrl.trim()
    );
    setOllamaConfigured(true);
    setOllamaStatus("success");
    setOllamaMessage("Ollama settings saved.");
    if (onSaved) {
      await onSaved();
    }
  }

  async function handleOllamaDelete() {
    await removeProviderConfig("ollama");
    setOllamaConfigured(false);
    form.setValue("apiKey", "");
    setOllamaStatus("idle");
    setOllamaMessage("");
    if (onSaved) {
      await onSaved();
    }
  }

  return (
    <div
      className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm"
      id="ollama-card"
    >
      <div className="pp:mb-4 pp:flex pp:items-center pp:gap-3">
        <Server className="pp:size-5 pp:text-muted-foreground" />
        <div>
          <h2 className="pp:font-semibold pp:text-lg">Ollama</h2>
          <p className="pp:text-muted-foreground pp:text-sm">
            Run models locally via Ollama.
          </p>
        </div>
      </div>

      <form
        className="pp:space-y-4"
        onSubmit={form.handleSubmit(handleOllamaSave)}
      >
        <div className="pp:grid pp:gap-4 sm:pp:grid-cols-2">
          <div className="pp:space-y-1.5">
            <Label htmlFor="ollama-base-url">Base URL</Label>
            <Controller
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <Input
                  id="ollama-base-url"
                  onChange={field.onChange}
                  placeholder="http://localhost:11434/v1"
                  value={field.value}
                />
              )}
            />
          </div>
          <div className="pp:space-y-1.5">
            <Label htmlFor="ollama-model">Model</Label>
            <Controller
              control={form.control}
              name="model"
              render={({ field }) => (
                <Input
                  id="ollama-model"
                  onChange={field.onChange}
                  placeholder="llama3.1"
                  value={field.value}
                />
              )}
            />
          </div>
        </div>

        <div className="pp:space-y-1.5">
          <Label htmlFor="ollama-api-key">
            API Key{" "}
            <span className="pp:text-muted-foreground">
              (optional for local Ollama, required for Ollama Cloud / remote
              endpoints)
            </span>
          </Label>
          <Controller
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <Input
                id="ollama-api-key"
                onChange={field.onChange}
                placeholder={
                  ollamaConfigured
                    ? "Leave empty to keep existing key"
                    : "Paste your API key"
                }
                type="password"
                value={field.value}
              />
            )}
          />
        </div>

        <div className="pp:flex pp:flex-wrap pp:items-center pp:gap-3">
          <Button
            className="pp:gap-2"
            disabled={ollamaStatus === "testing"}
            onClick={form.handleSubmit(handleOllamaTest)}
            type="button"
            variant="outline"
          >
            {ollamaStatus === "testing" && (
              <Loader2 className="pp:size-4 pp:animate-spin" />
            )}
            Test connection
          </Button>
          <Button className="pp:gap-2" type="submit">
            Save
          </Button>
          {ollamaConfigured && (
            <Button
              className="pp:gap-2"
              onClick={handleOllamaDelete}
              type="button"
              variant="destructive"
            >
              <Trash2 className="pp:size-4" />
              Delete
            </Button>
          )}
        </div>
      </form>

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
  );
}

function TransformersCard({ onSaved }: { onSaved?: () => void }) {
  const [transformersModels, setTransformersModelsState] = useState<
    StoredTransformersModel[]
  >([]);
  const [downloadStates, setDownloadStates] = useState<DownloadState>({});
  const [hfToken, setHfToken] = useState("");
  const [systemReqs] = useState<SystemRequirements | null>(() =>
    checkSystemRequirements()
  );
  const modelForm = useForm<{ modelId: string }>({
    defaultValues: {
      modelId: "",
    },
  });

  useEffect(() => {
    async function init() {
      const storedToken = await getDecryptedAccessToken("transformers");
      if (storedToken) {
        setHfToken(storedToken);
      }

      const models = await getTransformersModels();
      setTransformersModelsState(models);

      const initialDownloadStates: DownloadState = {};
      for (const model of models) {
        initialDownloadStates[model.modelId] = {
          progress: model.downloadProgress,
          status: model.status === "ready" ? "ready" : "idle",
        };
      }
      setDownloadStates(initialDownloadStates);
    }
    void init();
  }, []);

  async function handleAddTransformersModel() {
    const trimmed = modelForm.getValues("modelId").trim();
    if (!trimmed) {
      return;
    }

    const models = await addTransformersModel(trimmed);
    setTransformersModelsState(models);
    setDownloadStates((prev) => ({
      ...prev,
      [trimmed]: { progress: 0, status: "idle" },
    }));
    modelForm.reset({ modelId: "" });
  }

  async function handleDownloadModel(modelId: string) {
    setDownloadStates((prev) => ({
      ...prev,
      [modelId]: { progress: 0, status: "validating" },
    }));

    const storedToken = await getDecryptedAccessToken("transformers");

    const validation = await validateTransformersModel(
      modelId,
      storedToken ?? undefined
    );
    if (!validation.valid) {
      setDownloadStates((prev) => ({
        ...prev,
        [modelId]: {
          errorMessage: validation.message,
          progress: 0,
          status: "error",
        },
      }));
      await updateTransformersModelStatus(modelId, "error");
      return;
    }

    setDownloadStates((prev) => ({
      ...prev,
      [modelId]: { progress: 0, status: "downloading" },
    }));
    await updateTransformersModelStatus(modelId, "downloading", 0);

    let cancelled = false;

    try {
      const { env, AutoModelForCausalLM, AutoTokenizer } = await import(
        "@huggingface/transformers"
      );
      env.useWasmCache = false;
      env.allowLocalModels = false;
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

      if (storedToken) {
        const originalFetch = env.fetch;
        env.fetch = (input: string | URL, init?: Record<string, unknown>) => {
          const headers = new Headers(
            init?.headers as Record<string, string> | undefined
          );
          headers.set("Authorization", `Bearer ${storedToken}`);
          return originalFetch(input, { ...init, headers });
        };
      }

      const fileProgress = new Map<string, { loaded: number; total: number }>();

      function onFileProgress(p: {
        file?: string;
        loaded?: number;
        status: string;
        total?: number;
      }) {
        if (cancelled) {
          return;
        }
        if (p.status === "progress" && p.file) {
          fileProgress.set(p.file, {
            loaded: p.loaded || 0,
            total: p.total || 0,
          });
        }
        if (p.status === "progress_total" && p.file) {
          fileProgress.set(p.file, {
            loaded: p.loaded || 0,
            total: p.total || 0,
          });
        }
        let totalLoaded = 0;
        let totalBytes = 0;
        for (const { loaded, total } of fileProgress.values()) {
          if (total > 0) {
            totalLoaded += loaded;
            totalBytes += total;
          }
        }
        if (totalBytes > 0) {
          const pct = Math.round(Math.min(1, totalLoaded / totalBytes) * 100);
          setDownloadStates((prev) => ({
            ...prev,
            [modelId]: { progress: pct, status: "downloading" },
          }));
          void updateTransformersModelStatus(modelId, "downloading", pct);
        }
      }

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Model download timed out (exceeded 10 minutes). Keep this options tab open and ensure a stable internet connection while downloading."
              )
            ),
          600_000
        )
      );
      await Promise.race([
        Promise.all([
          AutoTokenizer.from_pretrained(modelId, {
            progress_callback: onFileProgress,
          }),
          AutoModelForCausalLM.from_pretrained(modelId, {
            device: "wasm",
            progress_callback: onFileProgress,
          }),
        ]),
        timeout,
      ]);

      if (cancelled) {
        return;
      }
      setDownloadStates((prev) => ({
        ...prev,
        [modelId]: { progress: 100, status: "ready" },
      }));
      await updateTransformersModelStatus(modelId, "ready", 100);
      await saveProviderConfig(
        "transformers",
        modelId,
        undefined,
        undefined,
        storedToken || undefined
      );
      if (onSaved) {
        await onSaved();
      }
    } catch (error) {
      cancelled = true;
      const message =
        error instanceof Error ? error.message : "Unknown download error.";
      let friendlyMessage = message;
      if (message.includes("Could not locate") && message.includes("onnx")) {
        friendlyMessage = `Model "${modelId}" does not have ONNX weights available. Use an ONNX-community model (e.g., onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA).`;
      } else if (
        message.includes("Could not locate") ||
        message.includes("404")
      ) {
        friendlyMessage = `Model "${modelId}" not found on Hugging Face Hub. Check the model ID.`;
      } else if (message.includes("Unauthorized") || message.includes("401")) {
        friendlyMessage = `Access denied to model "${modelId}". Save a valid Hugging Face access token above or use a public model.`;
      } else if (message.includes("tokenizer_class")) {
        friendlyMessage = `Model "${modelId}" is missing tokenizer configuration. Use a model specifically built for Transformers.js (e.g., onnx-community/SmolLM2-135M-Instruct-ONNX-MHA).`;
      }
      setDownloadStates((prev) => ({
        ...prev,
        [modelId]: {
          errorMessage: friendlyMessage,
          progress: 0,
          status: "error",
        },
      }));
      await updateTransformersModelStatus(modelId, "error");
    }
  }

  async function handleClearModelCache(modelId: string) {
    try {
      const cache = await caches.open("transformers-cache");
      const requests = await cache.keys();
      const matching = requests.filter((r) =>
        r.url.includes(encodeURIComponent(modelId))
      );
      await Promise.all(matching.map((r) => cache.delete(r)));
    } catch {
      // Cache API might not be available
    }

    setDownloadStates((prev) => ({
      ...prev,
      [modelId]: { progress: 0, status: "idle" },
    }));
    await updateTransformersModelStatus(modelId, "not-downloaded", 0);
  }

  async function handleRemoveTransformersModel(modelId: string) {
    await handleClearModelCache(modelId);
    const models = await removeTransformersModel(modelId);
    setTransformersModelsState(models);
    setDownloadStates((prev) => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
    if (onSaved) {
      await onSaved();
    }
  }

  function handleSelectRecommendedModel(modelId: string) {
    modelForm.setValue("modelId", modelId);
  }

  return (
    <div
      className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm"
      id="transformers-card"
    >
      <div className="pp:mb-4 pp:flex pp:items-center pp:gap-3">
        <Cpu className="pp:size-5 pp:text-muted-foreground" />
        <div>
          <h2 className="pp:font-semibold pp:text-lg">Transformers.js</h2>
          <p className="pp:text-muted-foreground pp:text-sm">
            In-browser AI models powered by Transformers.js and ONNX Runtime.
          </p>
        </div>
      </div>

      <SystemRequirementsBanner systemReqs={systemReqs} />

      <RecommendedModels
        downloadStates={downloadStates}
        onSelectModel={handleSelectRecommendedModel}
      />

      <ModelIdInput
        newModelId={modelForm.watch("modelId")}
        onAddModel={handleAddTransformersModel}
        onModelIdChange={(value) => modelForm.setValue("modelId", value)}
      />

      <HuggingFaceTokenSection initialToken={hfToken} />

      <TransformersWasmSettingsSection />

      {transformersModels.length === 0 ? (
        <p className="pp:py-8 pp:text-center pp:text-muted-foreground pp:text-sm">
          No models added yet. Add a Hugging Face model ID above to get started.
        </p>
      ) : (
        <TransformersModelList
          downloadStates={downloadStates}
          models={transformersModels}
          onDownload={handleDownloadModel}
          onRedownload={handleClearModelCache}
          onRemove={handleRemoveTransformersModel}
        />
      )}
    </div>
  );
}

interface ModelIdInputProps {
  newModelId: string;
  onAddModel: () => void;
  onModelIdChange: (value: string) => void;
}

function ModelIdInput({
  newModelId,
  onAddModel,
  onModelIdChange,
}: ModelIdInputProps) {
  return (
    <div className="pp:mb-4 pp:space-y-1.5">
      <Label htmlFor="transformers-model-id">Model ID</Label>
      <div className="pp:flex pp:items-center pp:gap-2">
        <Input
          id="transformers-model-id"
          onChange={(e) => onModelIdChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddModel();
            }
          }}
          placeholder="e.g., onnx-community/SmolLM2-135M-Instruct-ONNX-MHA"
          value={newModelId}
        />
        <Button className="pp:shrink-0 pp:gap-2" onClick={onAddModel}>
          <Plus className="pp:size-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

function SystemRequirementsBanner({
  systemReqs,
}: {
  systemReqs: SystemRequirements | null;
}) {
  if (!systemReqs) {
    return null;
  }

  if (systemReqs.meetsMinimum) {
    return (
      <div className="pp:mb-4 pp:flex pp:items-start pp:gap-2 pp:rounded-md pp:border pp:border-green-500/30 pp:bg-green-500/10 pp:px-3 pp:py-2 pp:text-sm">
        <CheckCircle2 className="pp:mt-0.5 pp:size-4 pp:shrink-0 pp:text-green-600" />
        <div className="pp:text-green-700">
          <span className="pp:font-medium">System ready for local AI.</span>
          <div className="pp:mt-0.5 pp:text-xs">
            {systemReqs.cpuCores} core{systemReqs.cpuCores === 1 ? "" : "s"}
            {systemReqs.deviceMemory !== null &&
              ` · ${systemReqs.deviceMemory}GB RAM`}
            {systemReqs.wasmSimd ? " · WASM SIMD" : ""}
            {systemReqs.webgpu ? " · WebGPU" : ""}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pp:mb-4 pp:flex pp:items-start pp:gap-2 pp:rounded-md pp:border pp:border-amber-500/30 pp:bg-amber-500/10 pp:px-3 pp:py-2 pp:text-sm">
      <TriangleAlert className="pp:mt-0.5 pp:size-4 pp:shrink-0 pp:text-amber-600" />
      <div className="pp:text-amber-800">
        <span className="pp:font-medium">
          System requirements not fully met:
        </span>
        <ul className="pp:mt-1 pp:list-inside pp:list-disc pp:space-y-0.5">
          {systemReqs.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecommendedModels({
  downloadStates,
  onSelectModel,
}: {
  downloadStates: DownloadState;
  onSelectModel: (modelId: string) => void;
}) {
  const available = RECOMMENDED_MODELS.filter(
    (m) => downloadStates[m.modelId]?.status !== "ready"
  );

  return (
    <div className="pp:mb-4 pp:rounded-lg pp:border pp:bg-muted/50 pp:p-4">
      <p className="pp:mb-2 pp:font-medium pp:text-sm">Recommended models</p>
      <p className="pp:mb-3 pp:text-muted-foreground pp:text-xs">
        Browse{" "}
        <a
          className="pp:underline"
          href="https://huggingface.co/onnx-community"
          rel="noopener"
          target="_blank"
        >
          onnx-community
        </a>{" "}
        on Hugging Face for all pre-converted models. Stick to models under 3B
        parameters for good in-browser performance.
      </p>
      {available.length === 0 ? (
        <p className="pp:text-muted-foreground pp:text-xs">
          All recommended models are already installed.
        </p>
      ) : (
        <div className="pp:grid pp:gap-2 sm:pp:grid-cols-2">
          {available.map((model) => (
            <button
              className="pp:flex pp:flex-col pp:items-start pp:gap-0.5 pp:rounded-md pp:border pp:bg-background pp:px-3 pp:py-2 pp:text-left pp:text-sm pp:transition-colors hover:pp:bg-accent"
              key={model.modelId}
              onClick={() => {
                onSelectModel(model.modelId);
              }}
              type="button"
            >
              <span className="pp:font-medium">{model.label}</span>
              <span className="pp:text-muted-foreground pp:text-xs">
                {model.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TransformersModelList({
  models,
  downloadStates,
  onDownload,
  onRedownload,
  onRemove,
}: {
  downloadStates: DownloadState;
  models: StoredTransformersModel[];
  onDownload: (modelId: string) => void;
  onRedownload: (modelId: string) => void;
  onRemove: (modelId: string) => void;
}) {
  const isDownloading = useMemo(
    () =>
      Object.values(downloadStates).some(
        (s) => s.status === "downloading" || s.status === "validating"
      ),
    [downloadStates]
  );

  useEffect(() => {
    if (!isDownloading) {
      return;
    }

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDownloading]);

  return (
    <div className="pp:space-y-3">
      {isDownloading && (
        <div className="pp:flex pp:items-start pp:gap-2 pp:rounded-md pp:border pp:border-amber-500/30 pp:bg-amber-500/10 pp:px-3 pp:py-2.5 pp:text-xs pp:text-amber-900 dark:pp:text-amber-200">
          <TriangleAlert className="pp:mt-0.5 pp:size-4 pp:shrink-0 pp:text-amber-600" />
          <div>
            <span className="pp:font-semibold">Model download in progress.</span>
            <p className="pp:mt-0.5">
              Please do not reload, close, or navigate away from this page until the download completes.
            </p>
          </div>
        </div>
      )}
      <div className="pp:space-y-2">
      {models.map((model) => {
        const dl = downloadStates[model.modelId] ?? {
          progress: 0,
          status: "idle",
        };

        return (
          <div
            className="pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:px-4 pp:py-3"
            key={model.modelId}
          >
            <div className="pp:flex pp:min-w-0 pp:flex-1 pp:flex-col pp:gap-1">
              <div className="pp:flex pp:items-center pp:gap-2">
                <span className="pp:font-medium pp:text-sm">{model.label}</span>
                <StatusBadge status={dl.status} />
              </div>
              <span className="pp:truncate pp:text-muted-foreground pp:text-xs">
                {model.modelId}
              </span>
              {dl.status === "downloading" && dl.progress < 100 && (
                <div className="pp:mt-1 pp:h-1.5 pp:w-full pp:overflow-hidden pp:rounded-full pp:bg-muted">
                  <div
                    className="pp:h-full pp:rounded-full pp:bg-primary pp:transition-[width]"
                    style={{ width: `${dl.progress}%` }}
                  />
                </div>
              )}
              {dl.status === "downloading" && dl.progress < 100 && (
                <span className="pp:text-muted-foreground pp:text-xs">
                  Downloading... {dl.progress}%
                </span>
              )}
              {dl.status === "downloading" && dl.progress >= 100 && (
                <span className="pp:flex pp:items-center pp:gap-1 pp:text-muted-foreground pp:text-xs">
                  <Loader2 className="pp:size-3 pp:animate-spin" />
                  Initializing model… this may take 1-2 minutes
                </span>
              )}
              {dl.status === "error" && dl.errorMessage && (
                <span className="pp:mt-1 pp:text-destructive pp:text-xs pp:leading-tight">
                  {dl.errorMessage}
                </span>
              )}
            </div>

            <div className="pp:ml-2 pp:flex pp:shrink-0 pp:items-center pp:gap-1.5">
              {(dl.status === "idle" || dl.status === "error") && (
                <Button
                  className="pp:gap-1.5"
                  onClick={() => onDownload(model.modelId)}
                  size="sm"
                  variant="outline"
                >
                  <Download className="pp:size-3.5" />
                  Download
                </Button>
              )}
              {dl.status === "validating" && (
                <Button
                  className="pp:gap-1.5"
                  disabled
                  size="sm"
                  variant="outline"
                >
                  <Loader2 className="pp:size-3.5 pp:animate-spin" />
                  Validating
                </Button>
              )}
              {dl.status === "downloading" && (
                <Button
                  className="pp:gap-1.5"
                  disabled
                  size="sm"
                  variant="outline"
                >
                  <Loader2 className="pp:size-3.5 pp:animate-spin" />
                  Downloading
                </Button>
              )}
              {dl.status === "ready" && (
                <Button
                  className="pp:gap-1.5"
                  onClick={() => onRedownload(model.modelId)}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="pp:size-3.5" />
                  Redownload
                </Button>
              )}
              <Button
                aria-label={`Remove ${model.label}`}
                onClick={() => onRemove(model.modelId)}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="pp:size-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`pp:rounded-full pp:border pp:px-2 pp:py-0.5 pp:font-medium pp:text-[10px] ${STATUS_BADGE_STYLES[status] ?? STATUS_BADGE_STYLES.idle}`}
    >
      {STATUS_BADGE_LABELS[status] ?? status}
    </span>
  );
}

interface ModelValidation {
  message: string;
  valid: boolean;
}

async function validateTransformersModel(
  modelId: string,
  accessToken?: string
): Promise<ModelValidation> {
  try {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `https://huggingface.co/api/models/${modelId}`,
      { headers }
    );

    if (response.status === 404) {
      return {
        message: `Model "${modelId}" not found on Hugging Face Hub.`,
        valid: false,
      };
    }
    if (response.status === 401 || response.status === 403) {
      if (!accessToken) {
        return {
          message: `Model "${modelId}" requires authentication. Save a Hugging Face access token above and try again.`,
          valid: false,
        };
      }
      return { message: "", valid: true };
    }
    if (!response.ok) {
      return { message: "", valid: true };
    }

    const data = await response.json();
    const siblings: Array<{ rfilename: string }> | undefined = data.siblings;
    if (!siblings) {
      return { message: "", valid: true };
    }

    const files = siblings.map((s) => s.rfilename);

    if (!files.includes("config.json")) {
      return {
        message: `Model "${modelId}" is missing config.json and cannot be used with Transformers.js.`,
        valid: false,
      };
    }

    const hasOnnx = files.some(
      (f) => f.startsWith("onnx/") && f.endsWith(".onnx")
    );
    if (!hasOnnx) {
      return {
        message: `Model "${modelId}" does not have ONNX weights. Only models with pre-converted ONNX weights can run in-browser. Use a model from the onnx-community organization.`,
        valid: false,
      };
    }

    const hasTokenizer =
      files.includes("tokenizer.json") ||
      files.includes("tokenizer_config.json");
    if (!hasTokenizer) {
      return {
        message: `Model "${modelId}" is missing tokenizer files.`,
        valid: false,
      };
    }

    return { message: "", valid: true };
  } catch {
    return { message: "", valid: true };
  }
}

function TransformersWasmSettingsSection() {
  const [proxy, setProxy] = useState(false);
  const [numThreads, setNumThreads] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      const config = await getTransformersExecutionConfig();
      setProxy(config.proxy);
      setNumThreads(config.numThreads);
    }
    void loadConfig();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      await setTransformersExecutionConfig({ numThreads, proxy });
      const { env } = await import("@huggingface/transformers");
      env.useWasmCache = false;
      if (env.backends.onnx?.wasm) {
        env.backends.onnx.wasm.proxy = proxy;
        env.backends.onnx.wasm.numThreads = numThreads;
      }
      setSavedStatus("WASM settings saved successfully.");
      setTimeout(() => setSavedStatus(null), 3000);
    } catch {
      setSavedStatus("Failed to save WASM settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="pp:mb-4 pp:rounded-lg pp:border pp:border-border/70 pp:p-4">
      <Accordion>
        <AccordionItem className="pp:border-b-0" value="wasm-settings">
          <AccordionTrigger className="pp:py-1 hover:pp:no-underline">
            <div className="pp:flex pp:items-center pp:gap-2">
              <Sliders className="pp:size-4 pp:text-muted-foreground" />
              <span className="pp:font-medium pp:text-sm">
                Advanced ONNX WASM Execution Settings
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pp:space-y-4 pp:pt-4">
            <div className="pp:rounded-md pp:border pp:border-amber-500/20 pp:bg-amber-500/10 pp:p-3 pp:text-amber-900 pp:text-xs dark:pp:text-amber-200">
              <p className="pp:mb-1 pp:font-semibold">
                Defaults: Web Worker Proxy = Disabled (false), CPU Threads = 1
              </p>
              <p>
                Chrome Extension Manifest V3 Service Workers (
                <code>ServiceWorkerGlobalScope</code>) prohibit dynamic{" "}
                <code>import()</code> and Web Worker sub-threading. Disabling
                proxy (<code>false</code>) and using <code>1</code> thread
                prevents background execution crashes.
              </p>
            </div>

            <div className="pp:grid pp:grid-cols-1 pp:gap-4 sm:pp:grid-cols-2">
              {/* Feature 1: Web Worker Proxy */}
              <div className="pp:flex pp:flex-col pp:justify-between pp:space-y-2 pp:rounded-lg pp:border pp:bg-muted/30 pp:p-3.5">
                <div className="pp:flex pp:items-start pp:gap-2.5">
                  <Checkbox
                    checked={proxy}
                    className="pp:mt-0.5"
                    id="transformers-proxy-checkbox"
                    onChange={(e) => setProxy(e.target.checked)}
                  />
                  <div>
                    <Label
                      className="pp:cursor-pointer pp:font-medium pp:text-xs"
                      htmlFor="transformers-proxy-checkbox"
                    >
                      Web Worker Proxy (<code>proxy</code>)
                    </Label>
                    <p className="pp:mt-1 pp:text-muted-foreground pp:text-xs">
                      Default: <strong>false (Disabled)</strong>. Prevents
                      background worker crashes in Chrome Manifest V3.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2: WASM CPU Threads */}
              <div className="pp:flex pp:flex-col pp:justify-between pp:space-y-2 pp:rounded-lg pp:border pp:bg-muted/30 pp:p-3.5">
                <div className="pp:space-y-1.5">
                  <Label
                    className="pp:font-medium pp:text-xs"
                    htmlFor="transformers-num-threads"
                  >
                    WASM CPU Threads (<code>numThreads</code>)
                  </Label>
                  <Select
                    onValueChange={(val) => setNumThreads(Number(val))}
                    value={String(numThreads)}
                  >
                    <SelectTrigger
                      className="pp:w-full"
                      id="transformers-num-threads"
                    >
                      <SelectValue placeholder="Select threads" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        1 Thread (Default - Safe for MV3)
                      </SelectItem>
                      <SelectItem value="2">2 Threads</SelectItem>
                      <SelectItem value="4">4 Threads</SelectItem>
                      <SelectItem value="8">8 Threads</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="pp:text-muted-foreground pp:text-xs">
                    Default: <strong>1</strong>. Avoids multi-threaded
                    background worker crashes in MV3.
                  </p>
                </div>
              </div>
            </div>

            <div className="pp:flex pp:items-center pp:justify-between pp:pt-2">
              <Button disabled={isSaving} onClick={handleSave} size="sm">
                {isSaving ? "Saving..." : "Save WASM Settings"}
              </Button>
              {savedStatus ? (
                <p className="pp:font-medium pp:text-green-600 pp:text-xs">
                  {savedStatus}
                </p>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
