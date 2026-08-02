import { CheckCircle2, Loader2, Sparkles, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	CATEGORY_LABELS,
	getProviderDefinition,
	PROVIDER_DEFINITIONS,
} from "@/features/providers/registry"
import { cn } from "@/lib/utils"
import type { OptionsState, ProviderCategory } from "@/types"

interface ProviderSetupFormProps {
	state: OptionsState
}

export function ProviderSetupForm({ state }: ProviderSetupFormProps) {
	return (
		<div className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
			<div className="pp:mb-6">
				<div className="pp:flex pp:items-center pp:justify-between pp:gap-3">
					<h2 className="pp:font-semibold pp:text-lg">Provider Setup</h2>
					<ProviderStatusBadge providerSummary={state.providerSummary} />
				</div>
				<p className="pp:mt-1 pp:text-muted-foreground pp:text-sm">
					Select a provider and enter your API key to get started.
				</p>
			</div>

			<div
				className="pp:grid pp:gap-4 sm:pp:grid-cols-2"
				id="pp-tour-provider-list"
			>
				<label className="pp:space-y-1.5">
					<span className="pp:font-medium pp:text-sm">Provider</span>
					<select
						className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
						onChange={(event) =>
							state.selectProvider(event.target.value as never)
						}
						value={state.selectedProvider}
					>
						{PROVIDER_DEFINITIONS.filter((p) => p.category !== "self-hosted")
							.reduce(
								(groups, p) => {
									const cat = (p.category ??
										"openai-compatible") as ProviderCategory
									const key = CATEGORY_LABELS[cat]
									const existing = groups.find((g) => g.key === key)
									if (existing) {
										existing.providers.push(p)
									} else {
										groups.push({ key, label: key, providers: [p] })
									}
									return groups
								},
								[] as Array<{
									key: string
									label: string
									providers: typeof PROVIDER_DEFINITIONS
								}>,
							)
							.map((group) => (
								<optgroup key={group.key} label={group.label}>
									{group.providers.map((provider) => (
										<option key={provider.id} value={provider.id}>
											{provider.label}
										</option>
									))}
								</optgroup>
							))}
					</select>
				</label>

				<label className="pp:space-y-1.5" id="pp-tour-model-field">
					<span className="pp:font-medium pp:text-sm">Model</span>
					<input
						className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
						onChange={(event) => state.setProviderModel(event.target.value)}
						placeholder={state.selectedProviderDefinition.defaultModel}
						value={state.providerModel}
					/>
				</label>
			</div>

			<label
				className="pp:mt-4 pp:block pp:space-y-1.5"
				id="pp-tour-api-key-field"
			>
				<span className="pp:font-medium pp:text-sm">
					API Key{" "}
					<span className="pp:text-muted-foreground">
						({state.selectedProviderDefinition.label})
					</span>
				</span>
				<input
					className="pp:h-9 pp:w-full pp:rounded-md pp:border pp:bg-background pp:px-3 pp:text-sm"
					onChange={(event) => state.setApiKey(event.target.value)}
					placeholder={
						state.hasStoredApiKey
							? "Leave empty to keep existing key"
							: "Paste your API key"
					}
					type="password"
					value={state.apiKey}
				/>
			</label>

			<div className="pp:mt-6 pp:flex pp:flex-wrap pp:items-center pp:gap-3">
				<Button
					className="pp:gap-2"
					disabled={state.isSavingProvider || !state.connectionVerified}
					id="pp-tour-save-btn"
					onClick={state.handleSaveProvider}
				>
					{state.isSavingProvider && (
						<Loader2 className="pp:h-4 pp:w-4 pp:animate-spin" />
					)}
					Save provider
				</Button>
				<Button
					className="pp:gap-2"
					disabled={state.isTestingProvider}
					id="pp-tour-test-btn"
					onClick={state.handleTestProvider}
					variant="outline"
				>
					{state.isTestingProvider && (
						<Loader2 className="pp:h-4 pp:w-4 pp:animate-spin" />
					)}
					Test connection
				</Button>
				{!state.connectionVerified && state.providerStatusType === "idle" && (
					<span className="pp:text-muted-foreground pp:text-xs">
						Test the connection before saving
					</span>
				)}
			</div>

			{state.providerStatusType !== "idle" && (
				<div
					className={cn(
						"pp:mt-4 pp:flex pp:items-center pp:gap-2 pp:rounded-md pp:border pp:px-3 pp:py-2 pp:text-sm",
						state.providerStatusType === "success"
							? "pp:border-green-500/30 pp:bg-green-500/10 pp:text-green-700 pp:dark:text-green-300"
							: "pp:border-destructive/40 pp:bg-destructive/10 pp:text-destructive",
					)}
				>
					{state.providerStatusType === "success" ? (
						<CheckCircle2 className="pp:h-4 pp:w-4 pp:shrink-0" />
					) : (
						<TriangleAlert className="pp:h-4 pp:w-4 pp:shrink-0" />
					)}
					<span>{state.providerStatusMessage}</span>
				</div>
			)}

			<div className="pp:mt-6 pp:flex pp:items-center pp:justify-between pp:border-t pp:pt-4">
				<div className="pp:flex pp:items-center pp:gap-2 pp:text-muted-foreground pp:text-sm">
					<Sparkles className="pp:h-4 pp:w-4" />
					<span>
						Configured:{" "}
						<span className="pp:font-medium pp:text-foreground">
							{state.providerSummary?.configuredProviders.length ?? 0}
						</span>{" "}
						/{" "}
						{
							PROVIDER_DEFINITIONS.filter((p) => p.category !== "self-hosted")
								.length
						}{" "}
						providers
					</span>
				</div>
			</div>
		</div>
	)
}

function ProviderStatusBadge({
	providerSummary,
}: {
	providerSummary: OptionsState["providerSummary"]
}) {
	const cloudUnconfigured = providerSummary
		? providerSummary.unconfiguredProviders.filter(
				(p) => getProviderDefinition(p).category !== "self-hosted",
			).length
		: 0

	return (
		<span
			className={
				cloudUnconfigured > 0
					? "pp:rounded-full pp:border pp:border-red-500/30 pp:bg-red-500/10 pp:px-2.5 pp:py-1 pp:font-medium pp:text-red-600 pp:text-xs"
					: "pp:rounded-full pp:border pp:border-green-500/30 pp:bg-green-500/10 pp:px-2.5 pp:py-1 pp:font-medium pp:text-green-600 pp:text-xs"
			}
		>
			{cloudUnconfigured > 0
				? `${cloudUnconfigured} not configured`
				: "All configured"}
		</span>
	)
}
