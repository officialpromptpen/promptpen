import { Edit3, Sparkles, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ConfiguredProviderDetail, OptionsState } from "@/types"

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	hour: "numeric",
	minute: "2-digit",
	month: "short",
})

function formatDate(timestamp: number): string {
	return DATE_FORMATTER.format(new Date(timestamp))
}

interface ConfiguredProvidersListProps {
	configuredProviderDetails: OptionsState["configuredProviderDetails"]
	handleDeleteProvider: OptionsState["handleDeleteProvider"]
	handleEditProvider: OptionsState["handleEditProvider"]
	selectedProvider: OptionsState["selectedProvider"]
}

export function ConfiguredProvidersList({
	configuredProviderDetails,
	handleDeleteProvider,
	handleEditProvider,
	selectedProvider,
}: ConfiguredProvidersListProps) {
	const [deleteConfirmProvider, setDeleteConfirmProvider] = useState<
		string | null
	>(null)

	if (configuredProviderDetails.length === 0) {
		return null
	}

	return (
		<div
			className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm"
			id="pp-tour-provider-setup"
		>
			<h2 className="pp:mb-1 pp:font-semibold pp:text-lg">
				Configured Providers
				<span className="pp:ml-2 pp:font-normal pp:text-muted-foreground pp:text-sm">
					({configuredProviderDetails.length})
				</span>
			</h2>
			<p className="pp:mb-4 pp:text-muted-foreground pp:text-sm">
				Click Edit to modify the model or API key, or Delete to remove the
				configuration.
			</p>

			<div className="pp:space-y-2">
				{configuredProviderDetails.map((detail) => {
					const isPendingDelete = deleteConfirmProvider === detail.provider
					const isCurrentlySelected = detail.provider === selectedProvider

					return (
						<ProviderDetailRow
							key={detail.provider}
							detail={detail}
							isCurrentlySelected={isCurrentlySelected}
							isPendingDelete={isPendingDelete}
							onCancelDelete={() => setDeleteConfirmProvider(null)}
							onConfirmDelete={async () => {
								setDeleteConfirmProvider(null)
								await handleDeleteProvider(detail.provider)
							}}
							onEdit={() => {
								handleEditProvider(detail.provider)
								setDeleteConfirmProvider(null)
							}}
							onRequestDelete={() => setDeleteConfirmProvider(detail.provider)}
						/>
					)
				})}
			</div>
		</div>
	)
}

interface ProviderDetailRowProps {
	detail: ConfiguredProviderDetail
	isCurrentlySelected: boolean
	isPendingDelete: boolean
	onCancelDelete: () => void
	onConfirmDelete: () => void
	onEdit: () => void
	onRequestDelete: () => void
}

function ProviderDetailRow({
	detail,
	isCurrentlySelected,
	isPendingDelete,
	onCancelDelete,
	onConfirmDelete,
	onEdit,
	onRequestDelete,
}: ProviderDetailRowProps) {
	return (
		<div
			className={cn(
				"pp:flex pp:items-center pp:justify-between pp:rounded-lg pp:border pp:px-4 pp:py-3 pp:transition-colors",
				isCurrentlySelected
					? "pp:border-primary/40 pp:bg-primary/5"
					: "pp:bg-card",
			)}
		>
			<div className="pp:flex pp:min-w-0 pp:items-center pp:gap-3">
				<div className="pp:flex pp:size-8 pp:shrink-0 pp:items-center pp:justify-center pp:rounded-full pp:bg-primary/10">
					<Sparkles
						aria-hidden="true"
						className="pp:size-4 pp:text-primary"
					/>
				</div>
				<div className="pp:flex pp:min-w-0:flex-col pp:gap-0.5">
					<div className="pp:flex pp:items-center pp:gap-2">
						<span className="pp:font-medium pp:text-foreground pp:text-sm">
							{detail.label}
						</span>
						{isCurrentlySelected && (
							<span className="pp:rounded-full pp:bg-primary/10 pp:px-1.5 pp:py-0.5 pp:font-medium pp:text-[9px] pp:text-primary">
								Editing
							</span>
						)}
					</div>
					<span className="pp:truncate pp:text-muted-foreground pp:text-xs">
						{detail.model} &middot; Updated {formatDate(detail.updatedAt)}
					</span>
				</div>
			</div>

			{isPendingDelete ? (
				<div className="pp:ml-2 pp:flex pp:shrink-0 pp:items-center pp:gap-1.5">
					<Button
						aria-label={`Delete ${detail.label}`}
						className="pp:rounded-xs"
						onClick={onConfirmDelete}
						title={`Delete ${detail.label}`}
						variant="destructive"
					>
						Delete
					</Button>
					<Button
						aria-label={`Cancel delete ${detail.label}`}
						className="pp:rounded-xs"
						onClick={onCancelDelete}
						title={`Cancel delete ${detail.label}`}
						variant="outline"
					>
						Cancel
					</Button>
				</div>
			) : (
				<div className="pp:ml-2 pp:flex pp:shrink-0 pp:items-center pp:gap-1.5">
					<Button
						aria-label={`Edit ${detail.label}`}
						onClick={onEdit}
						title={`Edit ${detail.label}`}
						type="button"
						variant="ghost"
					>
						<Edit3 aria-hidden="true" className="pp:size-3.5" />
					</Button>
					<Button
						aria-label={`Delete ${detail.label}`}
						onClick={onRequestDelete}
						title={`Delete ${detail.label}`}
						type="button"
						variant="ghost"
					>
						<Trash2 aria-hidden="true" className="pp:size-3.5" />
					</Button>
				</div>
			)}
		</div>
	)
}
