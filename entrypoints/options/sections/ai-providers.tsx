import { useState } from "react";
import type { PopularModel } from "@/constants/ai-providers/popular-models";
import { testProviderConnectionWithValues } from "@/features/providers/sdk";
import {
  getDecryptedApiKey,
  getProviderEditorState,
  recordProviderConnectionTest,
} from "@/features/providers/storage";
import type { AIProvider, OptionsState } from "@/types";
import { ConfiguredProvidersList } from "./ai-providers/configured-providers-list";
import { ProviderSetupForm } from "./ai-providers/provider-setup-form";
import { QuickAddPopularModels } from "./ai-providers/quick-add-models";
import { SettingsSectionLayout } from "./shared/section-shell";

export function AIProvidersSection(state: OptionsState) {
  const [pendingQuickAdd, setPendingQuickAdd] = useState<PopularModel | null>(
    null
  );

  async function handleRetryConnection(provider: AIProvider) {
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

  return (
    <SettingsSectionLayout
      description="Manage API keys, model presets, and default routing across cloud providers."
      title="AI Providers Setup"
    >
      <div className="pp:space-y-6">
        <ProviderSetupForm
          onQuickAddHandled={() => setPendingQuickAdd(null)}
          pendingQuickAdd={pendingQuickAdd}
          state={state}
        />

        <QuickAddPopularModels
          onSelect={(popularModel) => {
            setPendingQuickAdd(popularModel);
            state.setSelectedProvider(popularModel.provider);
          }}
        />

        <ConfiguredProvidersList
          configuredProviderDetails={state.configuredProviderDetails}
          handleDeleteProvider={state.handleDeleteProvider}
          handleEditProvider={state.handleEditProvider}
          onRetryConnection={handleRetryConnection}
          selectedProvider={state.selectedProvider}
        />
      </div>
    </SettingsSectionLayout>
  );
}
