import {
	CheckCircle2,
	Cpu,
	Download,
	Loader2,
	Plus,
	RefreshCw,
	Server,
	Trash2,
	TriangleAlert,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { testProviderConnectionWithValues } from "@/features/providers/sdk"
import {
	getDecryptedAccessToken,
	getDecryptedApiKey,
	getProviderEditorState,
	removeProviderConfig,
	saveProviderConfig,
} from "@/features/providers/storage"
import { RECOMMENDED_MODELS } from "@/features/providers/transformers/recommended-models"
import type {
	StoredTransformersModel,
	SystemRequirements,
} from "@/features/storage/self-hosted"
import {
	addTransformersModel,
	checkSystemRequirements,
	getTransformersModels,
	removeTransformersModel,
	updateTransformersModelStatus,
} from "@/features/storage/self-hosted"
import { HuggingFaceTokenSection } from "./self-hosted/hugging-face-token-section"

type OllamaStatus = "error" | "idle" | "success" | "testing"
interface ModelDownloadState {
	errorMessage?: string
	progress: number
	status: "downloading" | "error" | "idle" | "ready" | "validating"
}
type DownloadState = Record<string, ModelDownloadState>

const STATUS_BADGE_STYLES: Record<string, string> = {
	downloading: "pp:bg-blue-500/10 pp:text-blue-600 pp:border-blue-500/30",
	error: "pp:bg-destructive/10 pp:text-destructive pp:border-destructive/40",
	idle: "pp:bg-muted pp:text-muted-foreground",
	ready: "pp:bg-green-500/10 pp:text-green-600 pp:border-green-500/30",
	validating: "pp:bg-amber-500/10 pp:text-amber-600 pp:border-amber-500/30",
}

const STATUS_BADGE_LABELS: Record<string, string> = {
	downloading: "Downloading",
	error: "Error",
	idle: "Not downloaded",
	ready: "Ready",
	validating: "Validating",
}

export function SelfHostedSection() {
	return (
		<div className="pp:mx-auto pp:max-w-4xl pp:space-y-8 pp:px-8 pp:py-8">
			<div>
				<h1 className="pp:font-semibold pp:text-2xl pp:tracking-tight">
					Self-Hosted
				</h1>
				<p className="pp:mt-1 pp:text-muted-foreground pp:text-sm">
					Manage local and in-browser AI models.
				</p>
			</div>

			<OllamaCard />
			<TransformersCard />
		</div>
	)
}

function OllamaCard() {
	const [ollamaBaseUrl, setOllamaBaseUrl] = useState(
		"http://localhost:11434/v1",
	)
	const [ollamaModel, setOllamaModel] = useState("llama3.1")
	const [ollamaApiKey, setOllamaApiKey] = useState("")
	const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>("idle")
	const [ollamaMessage, setOllamaMessage] = useState("")
	const [ollamaConfigured, setOllamaConfigured] = useState(false)

	useEffect(() => {
		async function init() {
			const editorState = await getProviderEditorState("ollama")
			setOllamaModel(editorState.model)
			setOllamaConfigured(editorState.hasApiKey)

			const storedKey = await getDecryptedApiKey("ollama")
			if (storedKey) {
				setOllamaApiKey(storedKey)
			}
		}
		void init()
	}, [])

	async function handleOllamaTest() {
		setOllamaStatus("testing")
		setOllamaMessage("")

		let resolvedApiKey = ollamaApiKey.trim()
		if (!resolvedApiKey && ollamaConfigured) {
			const storedKey = await getDecryptedApiKey("ollama")
			if (storedKey) {
				resolvedApiKey = storedKey
			}
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
				setOllamaMessage(
					`Connection failed. ${result.message ?? "Unknown error."}`,
				)
			}
		} catch {
			setOllamaStatus("error")
			setOllamaMessage("Connection test failed unexpectedly.")
		}
	}

	async function handleOllamaSave() {
		await saveProviderConfig(
			"ollama",
			ollamaModel.trim(),
			ollamaApiKey.trim(),
			ollamaBaseUrl.trim(),
		)
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

	return (
		<div className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
			<div className="pp:mb-4 pp:flex pp:items-center pp:gap-3">
				<Server className="pp:size-5 pp:text-muted-foreground" />
				<div>
					<h2 className="pp:font-semibold pp:text-lg">Ollama</h2>
					<p className="pp:text-muted-foreground pp:text-sm">
						Run models locally via Ollama.
					</p>
				</div>
			</div>

			<div className="pp:grid pp:gap-4 sm:pp:grid-cols-2">
				<label className="pp:space-y-1.5">
					<span className="pp:font-medium pp:text-sm">Base URL</span>
					<input
						className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
						onChange={(e) => setOllamaBaseUrl(e.target.value)}
						placeholder="http://localhost:11434/v1"
						value={ollamaBaseUrl}
					/>
				</label>
				<label className="pp:space-y-1.5">
					<span className="pp:font-medium pp:text-sm">Model</span>
					<input
						className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
						onChange={(e) => setOllamaModel(e.target.value)}
						placeholder="llama3.1"
						value={ollamaModel}
					/>
				</label>
			</div>

			<label className="pp:mt-4 pp:block pp:space-y-1.5">
				<span className="pp:font-medium pp:text-sm">
					API Key{" "}
					<span className="pp:text-muted-foreground">
						(optional for Ollama)
					</span>
				</span>
				<input
					className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
					onChange={(e) => setOllamaApiKey(e.target.value)}
					placeholder={
						ollamaConfigured
							? "Leave empty to keep existing key"
							: "Paste your API key"
					}
					type="password"
					value={ollamaApiKey}
				/>
			</label>

			<div className="pp:mt-4 pp:flex pp:flex-wrap pp:items-center pp:gap-3">
				<Button
					className="pp:gap-2"
					disabled={ollamaStatus === "testing"}
					onClick={handleOllamaTest}
					variant="outline"
				>
					{ollamaStatus === "testing" && (
						<Loader2 className="pp:size-4 pp:animate-spin" />
					)}
					Test connection
				</Button>
				<Button className="pp:gap-2" onClick={handleOllamaSave}>
					Save
				</Button>
				{ollamaConfigured && (
					<Button
						className="pp:gap-2"
						onClick={handleOllamaDelete}
						variant="destructive"
					>
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
	)
}

function TransformersCard() {
	const [transformersModels, setTransformersModelsState] = useState<
		StoredTransformersModel[]
	>([])
	const [newModelId, setNewModelId] = useState("")
	const [downloadStates, setDownloadStates] = useState<DownloadState>({})
	const [hfToken, setHfToken] = useState("")
	const [hfTokenSaved, setHfTokenSaved] = useState(false)
	const [systemReqs] = useState<SystemRequirements | null>(() =>
		checkSystemRequirements(),
	)

	useEffect(() => {
		async function init() {
			const storedToken = await getDecryptedAccessToken("transformers")
			if (storedToken) {
				setHfToken(storedToken)
				setHfTokenSaved(true)
			}

			const models = await getTransformersModels()
			setTransformersModelsState(models)

			const initialDownloadStates: DownloadState = {}
			for (const model of models) {
				initialDownloadStates[model.modelId] = {
					progress: model.downloadProgress,
					status: model.status === "ready" ? "ready" : "idle",
				}
			}
			setDownloadStates(initialDownloadStates)
		}
		void init()
	}, [])

	async function handleAddTransformersModel() {
		const trimmed = newModelId.trim()
		if (!trimmed) {
			return
		}

		const models = await addTransformersModel(trimmed)
		setTransformersModelsState(models)
		setDownloadStates((prev) => ({
			...prev,
			[trimmed]: { progress: 0, status: "idle" },
		}))
		setNewModelId("")
	}

	async function handleDownloadModel(modelId: string) {
		setDownloadStates((prev) => ({
			...prev,
			[modelId]: { progress: 0, status: "validating" },
		}))

		const storedToken = await getDecryptedAccessToken("transformers")

		const validation = await validateTransformersModel(
			modelId,
			storedToken ?? undefined,
		)
		if (!validation.valid) {
			setDownloadStates((prev) => ({
				...prev,
				[modelId]: {
					errorMessage: validation.message,
					progress: 0,
					status: "error",
				},
			}))
			await updateTransformersModelStatus(modelId, "error")
			return
		}

		setDownloadStates((prev) => ({
			...prev,
			[modelId]: { progress: 0, status: "downloading" },
		}))
		await updateTransformersModelStatus(modelId, "downloading", 0)

		let cancelled = false

		try {
			const { env, AutoModelForCausalLM, AutoTokenizer } = await import(
				"@huggingface/transformers"
			)
			const base = globalThis.chrome?.runtime?.getURL("onnx/")
			if (base && env.backends.onnx?.wasm) {
				env.backends.onnx.wasm.wasmPaths = {
					mjs: `${base}ort-wasm-simd-threaded.asyncify.mjs`,
					wasm: `${base}ort-wasm-simd-threaded.asyncify.wasm`,
				}
			}

			if (storedToken) {
				const originalFetch = env.fetch
				env.fetch = (input: string | URL, init?: Record<string, unknown>) => {
					const headers = new Headers(
						init?.headers as Record<string, string> | undefined,
					)
					headers.set("Authorization", `Bearer ${storedToken}`)
					return originalFetch(input, { ...init, headers })
				}
			}

			const fileProgress = new Map<string, { loaded: number; total: number }>()

			function onFileProgress(p: {
				file?: string
				loaded?: number
				status: string
				total?: number
			}) {
				if (cancelled) {
					return
				}
				if (p.status === "progress" && p.file) {
					fileProgress.set(p.file, {
						loaded: p.loaded || 0,
						total: p.total || 0,
					})
				}
				if (p.status === "progress_total" && p.file) {
					fileProgress.set(p.file, {
						loaded: p.loaded || 0,
						total: p.total || 0,
					})
				}
				let totalLoaded = 0
				let totalBytes = 0
				for (const { loaded, total } of fileProgress.values()) {
					if (total > 0) {
						totalLoaded += loaded
						totalBytes += total
					}
				}
				if (totalBytes > 0) {
					const pct = Math.round(Math.min(1, totalLoaded / totalBytes) * 100)
					setDownloadStates((prev) => ({
						...prev,
						[modelId]: { progress: pct, status: "downloading" },
					}))
					void updateTransformersModelStatus(modelId, "downloading", pct)
				}
			}

			const timeout = new Promise<never>((_, reject) =>
				setTimeout(
					() => reject(new Error("Model download timed out after 10 minutes.")),
					600_000,
				),
			)
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
			])

			if (cancelled) {
				return
			}
			setDownloadStates((prev) => ({
				...prev,
				[modelId]: { progress: 100, status: "ready" },
			}))
			await updateTransformersModelStatus(modelId, "ready", 100)
			await saveProviderConfig(
				"transformers",
				modelId,
				undefined,
				undefined,
				storedToken || undefined,
			)
		} catch (error) {
			cancelled = true
			const message =
				error instanceof Error ? error.message : "Unknown download error."
			let friendlyMessage = message
			if (message.includes("Could not locate") && message.includes("onnx")) {
				friendlyMessage = `Model "${modelId}" does not have ONNX weights available. Use an ONNX-community model (e.g., onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA).`
			} else if (
				message.includes("Could not locate") ||
				message.includes("404")
			) {
				friendlyMessage = `Model "${modelId}" not found on Hugging Face Hub. Check the model ID.`
			} else if (message.includes("Unauthorized") || message.includes("401")) {
				friendlyMessage = `Access denied to model "${modelId}". Save a valid Hugging Face access token above or use a public model.`
			} else if (message.includes("tokenizer_class")) {
				friendlyMessage = `Model "${modelId}" is missing tokenizer configuration. Use a model specifically built for Transformers.js (e.g., onnx-community/SmolLM2-135M-Instruct-ONNX-MHA).`
			}
			setDownloadStates((prev) => ({
				...prev,
				[modelId]: {
					errorMessage: friendlyMessage,
					progress: 0,
					status: "error",
				},
			}))
			await updateTransformersModelStatus(modelId, "error")
		}
	}

	async function handleClearModelCache(modelId: string) {
		try {
			const cache = await caches.open("transformers-cache")
			const requests = await cache.keys()
			const matching = requests.filter((r) =>
				r.url.includes(encodeURIComponent(modelId)),
			)
			await Promise.all(matching.map((r) => cache.delete(r)))
		} catch {
			// Cache API might not be available
		}

		setDownloadStates((prev) => ({
			...prev,
			[modelId]: { progress: 0, status: "idle" },
		}))
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
		<div className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
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
				onSelectModel={setNewModelId}
			/>

			<ModelIdInput
				newModelId={newModelId}
				onAddModel={handleAddTransformersModel}
				onModelIdChange={setNewModelId}
			/>

			<HuggingFaceTokenSection initialToken={hfToken} />

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
	)
}

interface ModelIdInputProps {
	newModelId: string
	onAddModel: () => void
	onModelIdChange: (value: string) => void
}

function ModelIdInput({
	newModelId,
	onAddModel,
	onModelIdChange,
}: ModelIdInputProps) {
	return (
		<div className="pp:mb-4 pp:space-y-1.5">
			<label
				className="pp:font-medium pp:text-sm"
				htmlFor="transformers-model-id"
			>
				Model ID
			</label>
			<div className="pp:flex pp:items-center pp:gap-2">
				<input
					className="pp:h-9 pp:flex-1 pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
					id="transformers-model-id"
					onChange={(e) => onModelIdChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							onAddModel()
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
	)
}

function SystemRequirementsBanner({
	systemReqs,
}: {
	systemReqs: SystemRequirements | null
}) {
	if (!systemReqs) {
		return null
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
		)
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
	)
}

function RecommendedModels({
	downloadStates,
	onSelectModel,
}: {
	downloadStates: DownloadState
	onSelectModel: (modelId: string) => void
}) {
	const available = RECOMMENDED_MODELS.filter(
		(m) => downloadStates[m.modelId]?.status !== "ready",
	)

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
								onSelectModel(model.modelId)
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
	)
}

function TransformersModelList({
	models,
	downloadStates,
	onDownload,
	onRedownload,
	onRemove,
}: {
	downloadStates: DownloadState
	models: StoredTransformersModel[]
	onDownload: (modelId: string) => void
	onRedownload: (modelId: string) => void
	onRemove: (modelId: string) => void
}) {
	return (
		<div className="pp:space-y-2">
			{models.map((model) => {
				const dl = downloadStates[model.modelId] ?? {
					progress: 0,
					status: "idle",
				}

				return (
					<div
						className="pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:px-4 pp:py-3"
						key={model.modelId}
					>
						<div className="pp:flex pp:min-w-0 pp:flex-1 pp:flex-col pp:gap-1">
							<div className="pp:flex pp:items-center pp:gap-2">
								<span className="pp:font-medium pp:text-sm">
									{model.label}
								</span>
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
				)
			})}
		</div>
	)
}

function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`pp:rounded-full pp:border pp:px-2 pp:py-0.5 pp:font-medium pp:text-[10px] ${STATUS_BADGE_STYLES[status] ?? STATUS_BADGE_STYLES.idle}`}
		>
			{STATUS_BADGE_LABELS[status] ?? status}
		</span>
	)
}

interface ModelValidation {
	message: string
	valid: boolean
}

async function validateTransformersModel(
	modelId: string,
	accessToken?: string,
): Promise<ModelValidation> {
	try {
		const headers: Record<string, string> = {}
		if (accessToken) {
			headers["Authorization"] = `Bearer ${accessToken}`
		}

		const response = await fetch(
			`https://huggingface.co/api/models/${modelId}`,
			{ headers },
		)

		if (response.status === 404) {
			return {
				message: `Model "${modelId}" not found on Hugging Face Hub.`,
				valid: false,
			}
		}
		if (response.status === 401 || response.status === 403) {
			if (!accessToken) {
				return {
					message: `Model "${modelId}" requires authentication. Save a Hugging Face access token above and try again.`,
					valid: false,
				}
			}
			return { message: "", valid: true }
		}
		if (!response.ok) {
			return { message: "", valid: true }
		}

		const data = await response.json()
		const siblings: Array<{ rfilename: string }> | undefined = data.siblings
		if (!siblings) {
			return { message: "", valid: true }
		}

		const files = siblings.map((s) => s.rfilename)

		if (!files.includes("config.json")) {
			return {
				message: `Model "${modelId}" is missing config.json and cannot be used with Transformers.js.`,
				valid: false,
			}
		}

		const hasOnnx = files.some(
			(f) => f.startsWith("onnx/") && f.endsWith(".onnx"),
		)
		if (!hasOnnx) {
			return {
				message: `Model "${modelId}" does not have ONNX weights. Only models with pre-converted ONNX weights can run in-browser. Use a model from the onnx-community organization.`,
				valid: false,
			}
		}

		const hasTokenizer =
			files.includes("tokenizer.json") ||
			files.includes("tokenizer_config.json")
		if (!hasTokenizer) {
			return {
				message: `Model "${modelId}" is missing tokenizer files.`,
				valid: false,
			}
		}

		return { message: "", valid: true }
	} catch {
		return { message: "", valid: true }
	}
}
