import { Save, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVIDER_MODEL_PRESETS } from "@/constants/ai-providers/model-options";
import {
  CATEGORY_LABELS,
  getProviderDefinition,
} from "@/features/providers/registry";
import {
  saveProviderConfig,
  setDefaultProvider,
} from "@/features/providers/storage";
import type { StoredTransformersModel } from "@/features/storage/self-hosted";
import {
  getSelectedTransformersModelIds,
  getTransformersModels,
  setSelectedTransformersModelIds,
} from "@/features/storage/self-hosted";
import type { AIProvider, OptionsState, ProviderCategory } from "@/types";
import { SettingsSectionLayout } from "./shared/section-shell";

interface GeneralFormValues {
  defaultModel: string;
  defaultProvider: AIProvider;
  transformersDefaultModel: string;
}

export function GeneralSection(state: OptionsState) {
  const [isSaving, setIsSaving] = useState(false);
  const [downloadedTransformersModels, setDownloadedTransformersModels] =
    useState<StoredTransformersModel[]>([]);

  const configuredProviders = state.providerSummary?.configuredProviders ?? [];
  const fallbackProvider =
    state.settings.defaultProvider ??
    state.providerSummary?.defaultProvider ??
    configuredProviders[0] ??
    "openai";

  const configuredModelByProvider = useMemo(
    () =>
      new Map(
        state.configuredProviderDetails.map((item) => [
          item.provider,
          item.model,
        ])
      ),
    [state.configuredProviderDetails]
  );

  const providerOptions = useMemo(
    () =>
      configuredProviders.map((providerId) => {
        const definition = getProviderDefinition(providerId);
        return {
          group:
            CATEGORY_LABELS[
              (definition.category ?? "openai-compatible") as ProviderCategory
            ],
          id: providerId,
          name: definition.label,
        };
      }),
    [configuredProviders]
  );

  const form = useForm<GeneralFormValues>({
    defaultValues: {
      defaultModel:
        state.settings.defaultModel ??
        configuredModelByProvider.get(fallbackProvider as AIProvider) ??
        getProviderDefinition(fallbackProvider as AIProvider).defaultModel,
      defaultProvider: fallbackProvider as AIProvider,
      transformersDefaultModel: "",
    },
    mode: "onChange",
  });

  const selectedProvider = form.watch("defaultProvider");

  const modelOptions = useMemo(() => {
    const provider = selectedProvider as AIProvider;
    const definition = getProviderDefinition(provider);
    const configuredModel = configuredModelByProvider.get(provider);
    const presetOptions = PROVIDER_MODEL_PRESETS[provider] ?? [];

    const choices = [
      ...(configuredModel
        ? [{ label: `Configured: ${configuredModel}`, value: configuredModel }]
        : []),
      ...presetOptions,
      {
        label: `Provider default: ${definition.defaultModel}`,
        value: definition.defaultModel,
      },
    ];

    const uniqueChoices = new Map<string, { label: string; value: string }>();
    for (const choice of choices) {
      if (!uniqueChoices.has(choice.value)) {
        uniqueChoices.set(choice.value, choice);
      }
    }

    return Array.from(uniqueChoices.values());
  }, [configuredModelByProvider, selectedProvider]);

  useEffect(() => {
    async function loadTransformersModels() {
      const allModels = await getTransformersModels();
      const readyModels = allModels.filter((m) => m.status === "ready");
      setDownloadedTransformersModels(readyModels);

      const selectedIds = await getSelectedTransformersModelIds();
      const defaultTransformersModel = selectedIds[0] ?? readyModels[0]?.modelId ?? "";
      form.setValue("transformersDefaultModel", defaultTransformersModel);
    }
    void loadTransformersModels();
  }, [form]);

  useEffect(() => {
    const nextProvider = fallbackProvider as AIProvider;
    const nextModel =
      state.settings.defaultModel ??
      configuredModelByProvider.get(nextProvider) ??
      getProviderDefinition(nextProvider).defaultModel;

    form.reset({
      defaultModel: nextModel,
      defaultProvider: nextProvider,
      transformersDefaultModel: form.getValues("transformersDefaultModel"),
    });
  }, [
    configuredModelByProvider,
    fallbackProvider,
    form,
    state.settings.defaultModel,
  ]);

  async function handleSave(values: GeneralFormValues) {
    setIsSaving(true);
    try {
      await setDefaultProvider(values.defaultProvider);
      await saveProviderConfig(values.defaultProvider, values.defaultModel);
      await state.refreshProviderData();

      if (values.transformersDefaultModel) {
        await setSelectedTransformersModelIds([
          values.transformersDefaultModel,
        ]);
        await saveProviderConfig("transformers", values.transformersDefaultModel);
      }

      state.setSettings((previous) => ({
        ...previous,
        defaultModel: values.defaultModel,
        defaultProvider: values.defaultProvider,
      }));
    } catch {
      // Error handling
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    const nextProvider = fallbackProvider as AIProvider;
    const nextModel =
      state.settings.defaultModel ??
      configuredModelByProvider.get(nextProvider) ??
      getProviderDefinition(nextProvider).defaultModel;

    form.reset({
      defaultModel: nextModel,
      defaultProvider: nextProvider,
      transformersDefaultModel: form.getValues("transformersDefaultModel"),
    });
  }

  return (
    <SettingsSectionLayout
      description="Configure core behavior and AI orchestration for your browsing experience."
      title="General Settings"
    >
      <div className="pp:space-y-6">
        <Card className="pp:shadow-sm">
          <CardHeader>
            <CardTitle className="pp:flex pp:items-center pp:gap-2">
              <span className="pp:flex pp:size-8 pp:items-center pp:justify-center pp:rounded-full pp:bg-primary/10 pp:text-primary">
                <Sparkles className="pp:size-4" />
              </span>
              AI Provider Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="pp:space-y-4"
              onSubmit={form.handleSubmit(handleSave)}
            >
              <div className="pp:space-y-1.5">
                <Label
                  className="pp:text-xs pp:uppercase pp:tracking-wide"
                  htmlFor="general-default-provider"
                >
                  Default AI Provider
                </Label>
                <Controller
                  control={form.control}
                  name="defaultProvider"
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        const nextProvider = value as AIProvider;
                        field.onChange(nextProvider);

                        const nextModel =
                          configuredModelByProvider.get(nextProvider) ??
                          PROVIDER_MODEL_PRESETS[nextProvider]?.[0]?.value ??
                          getProviderDefinition(nextProvider).defaultModel;

                        form.setValue("defaultModel", nextModel, {
                          shouldDirty: true,
                        });
                      }}
                      value={field.value}
                    >
                      <SelectTrigger
                        className="pp:w-full"
                        id="general-default-provider"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providerOptions.map((option) => (
                          <SelectGroup key={option.id}>
                            <SelectLabel>{option.group}</SelectLabel>
                            <SelectItem value={option.id}>
                              {option.name}
                            </SelectItem>
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="pp:text-muted-foreground pp:text-xs">
                  Select the primary engine to handle your queries.
                </p>
              </div>

              <div className="pp:space-y-1.5">
                <Label
                  className="pp:text-xs pp:uppercase pp:tracking-wide"
                  htmlFor="general-default-model"
                >
                  Default AI Model
                </Label>
                <Controller
                  control={form.control}
                  name="defaultModel"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className="pp:w-full"
                        id="general-default-model"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="pp:space-y-1.5">
                <Label
                  className="pp:text-xs pp:uppercase pp:tracking-wide"
                  htmlFor="transformers-default-model"
                >
                  Default Transformers.js Model
                </Label>
                <Controller
                  control={form.control}
                  name="transformersDefaultModel"
                  render={({ field }) => (
                    <Select
                      disabled={downloadedTransformersModels.length === 0}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        className="pp:w-full"
                        id="transformers-default-model"
                      >
                        <SelectValue
                          placeholder={
                            downloadedTransformersModels.length === 0
                              ? "No models downloaded yet"
                              : "Select a downloaded model"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {downloadedTransformersModels.map((model) => (
                          <SelectItem
                            key={model.modelId}
                            value={model.modelId}
                          >
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="pp:text-muted-foreground pp:text-xs">
                  {downloadedTransformersModels.length === 0
                    ? "Download models in Self-Hosted section to select a default."
                    : "Select which downloaded model to use as the default for Transformers.js."}
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="pp:sticky pp:bottom-0 pp:flex pp:items-center pp:justify-between pp:rounded-xl pp:border pp:bg-card pp:px-6 pp:py-4 pp:shadow-sm">
          <div className="pp:flex pp:items-center pp:gap-2 pp:text-muted-foreground pp:text-sm">
            <span className="pp:inline-flex pp:size-5 pp:items-center pp:justify-center pp:rounded-full pp:bg-primary/10 pp:text-primary">
              <span className="pp:size-2 pp:rounded-full pp:bg-primary" />
            </span>
            Changes will take effect immediately upon saving.
          </div>
          <div className="pp:flex pp:items-center pp:gap-3">
            <Button onClick={handleDiscard} type="button" variant="ghost">
              Discard
            </Button>
            <Button
              className="pp:gap-2"
              disabled={isSaving}
              onClick={form.handleSubmit(handleSave)}
              type="button"
            >
              {isSaving ? (
                <span className="pp:size-4 pp:animate-spin pp:rounded-full pp:border-2 pp:border-current pp:border-t-transparent" />
              ) : (
                <Save className="pp:size-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </SettingsSectionLayout>
  );
}
