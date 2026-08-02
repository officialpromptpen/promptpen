import type { OptionsState } from "@/types"
import { ProviderSetupForm } from "./ai-providers/provider-setup-form"
import { ConfiguredProvidersList } from "./ai-providers/configured-providers-list"

export function AIProvidersSection(state: OptionsState) {
	return (
		<div className="pp:mx-auto pp:max-w-4xl pp:space-y-8 pp:px-8 pp:py-8">
			<div>
				<h1 className="pp:font-semibold pp:text-2xl pp:tracking-tight">
					AI Providers
				</h1>
				<p className="pp:mt-1 pp:text-muted-foreground pp:text-sm">
					Manage your AI provider API keys and configuration.
				</p>
			</div>

			<ProviderSetupForm state={state} />

			<ConfiguredProvidersList
				configuredProviderDetails={state.configuredProviderDetails}
				handleDeleteProvider={state.handleDeleteProvider}
				handleEditProvider={state.handleEditProvider}
				selectedProvider={state.selectedProvider}
			/>
		</div>
	)
}
