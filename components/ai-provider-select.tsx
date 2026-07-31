import * as React from "react"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { ProviderIcon } from "@/features/providers/provider-icons"
import { setDefaultProvider } from "@/features/providers/storage"
import type { AIProviderOption } from "@/components/ai-provider-constants"
import type { AIProvider } from "@/types"

export interface AIProviderSelectDefaultProps {
	value?: string
	onValueChange?: (value: string | null) => void
	providers: AIProviderOption[]
	placeholder?: string
	disabled?: boolean
	size?: "sm" | "default"
	className?: string
}

function groupProviders(providers: AIProviderOption[]) {
	const map = new Map<string, AIProviderOption[]>()
	for (const p of providers) {
		const group = map.get(p.group)
		if (group) {
			group.push(p)
		} else {
			map.set(p.group, [p])
		}
	}
	return Array.from(map.entries())
}

export const AIProviderSelectDefault = React.forwardRef<
	HTMLButtonElement,
	AIProviderSelectDefaultProps
>(
	(
		{
			value,
			onValueChange,
			providers,
			placeholder = "Select AI Provider",
			disabled = false,
			size = "default",
			className,
		},
		ref,
	) => {
		const selectedName = providers.find((p) => p.id === value)?.name ?? ""
		const groups = React.useMemo(() => groupProviders(providers), [providers])

		return (
			<Select
				value={value}
				onValueChange={(newValue) => {
					if (newValue) {
						setDefaultProvider(newValue as AIProvider)
					}
					onValueChange?.(newValue)
				}}
				disabled={disabled}
			>
				<SelectTrigger
					ref={ref}
					size={size}
					className={className}
					aria-label="Select AI Provider"
				>

					{value ? (
						<div className="pp:flex pp:items-center pp:gap-2">
							<ProviderIcon
								provider={value as AIProvider}
								className="pp:size-4"
							/>
							<span className="pp:text-foreground pp:capitalize pp:px-1 pp:py-1">{selectedName}</span>
						</div>
					) : (<div className="pp:flex pp:items-center pp:gap-2">
						<span className="pp:text-sm pp:py-1 pp:px-2 pp:capitalize">{placeholder}</span>
					</div>)
					}

				</SelectTrigger>

				<SelectContent>
					{groups.length === 0 ? (
						<div className="pp:p-3 pp:text-sm pp:text-muted-foreground">
							No providers available
						</div>
					) : (
						groups.map(([groupLabel, groupProviders]) => (
							<SelectGroup key={groupLabel}>
								<SelectLabel className="pp:font-semibold pp:text-xs pp:uppercase pp:tracking-wide pp:text-muted-foreground">
									{groupLabel}
								</SelectLabel>
								{groupProviders.map((provider) => (
									<SelectItem key={provider.id} value={provider.id}>
										<div className="pp:flex pp:items-center pp:gap-2">
											<ProviderIcon
												provider={provider.id as AIProvider}
												className="pp:size-4"
											/>
											<span>{provider.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectGroup>
						))
					)}
				</SelectContent>
			</Select>
		)
	},
)

AIProviderSelectDefault.displayName = "AIProviderSelectDefault"
