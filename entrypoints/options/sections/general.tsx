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
import {
  CATEGORY_LABELS,
  getProviderDefinition,
} from "@/features/providers/registry";
import {
  saveProviderConfig,
  setDefaultProvider,
} from "@/features/providers/storage";
import type { AIProvider, OptionsState, ProviderCategory } from "@/types";
import { SettingsSectionLayout } from "./shared/section-shell";

interface GeneralFormValues {
  defaultModel: string;
  defaultProvider: AIProvider;
}

export function GeneralSection(state: OptionsState) {
  const [isSaving, setIsSaving] = useState(false);

  const configuredProviders = state.providerSummary?.configuredProviders ?? [];
  const fallbackProvider =
    (state.settings.defaultProvider &&
    configuredProviders.includes(state.settings.defaultProvider)
      ? state.settings.defaultProvider
      : configuredProviders[0]) ?? null;

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
        (fallbackProvider ? configuredModelByProvider.get(fallbackProvider) : "") ??
        "",
      defaultProvider: (fallbackProvider ?? "") as AIProvider,
    },
    mode: "onChange",
  });

  const selectedProvider = form.watch("defaultProvider");

  const modelOptions = useMemo(() => {
    const provider = selectedProvider as AIProvider;
    if (!provider) {
      return [];
    }

    const providerDetails = state.configuredProviderDetails.filter(
      (item) => item.provider === provider
    );

    const activeModels = new Set<string>();
    for (const detail of providerDetails) {
      if (detail.model) {
        activeModels.add(detail.model);
      }
      if (detail.models) {
        for (const m of detail.models) {
          activeModels.add(m);
        }
      }
    }

    return Array.from(activeModels).map((modelId) => ({
      label: modelId,
      value: modelId,
    }));
  }, [selectedProvider, state.configuredProviderDetails]);

  useEffect(() => {
    if (!fallbackProvider) {
      form.reset({
        defaultModel: "",
        defaultProvider: "" as AIProvider,
      });
      return;
    }

    const providerDetails = state.configuredProviderDetails.filter(
      (item) => item.provider === fallbackProvider
    );
    const activeModel =
      state.settings.defaultModel || providerDetails[0]?.model || "";

    form.reset({
      defaultModel: activeModel,
      defaultProvider: fallbackProvider,
    });
  }, [
    configuredProviders,
    fallbackProvider,
    form,
    state.configuredProviderDetails,
    state.settings.defaultModel,
  ]);

  async function handleSave(values: GeneralFormValues) {
    setIsSaving(true);
    try {
      if (values.defaultProvider && values.defaultModel) {
        await setDefaultProvider(values.defaultProvider);
        await saveProviderConfig(values.defaultProvider, values.defaultModel);
      }
      await state.refreshProviderData();

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
    if (!fallbackProvider) {
      form.reset({
        defaultModel: "",
        defaultProvider: "" as AIProvider,
      });
      return;
    }

    const providerDetails = state.configuredProviderDetails.filter(
      (item) => item.provider === fallbackProvider
    );
    const activeModel =
      state.settings.defaultModel || providerDetails[0]?.model || "";

    form.reset({
      defaultModel: activeModel,
      defaultProvider: fallbackProvider,
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
                      disabled={providerOptions.length === 0}
                      onValueChange={(value) => {
                        const nextProvider = value as AIProvider;
                        field.onChange(nextProvider);

                        const providerDetails =
                          state.configuredProviderDetails.filter(
                            (item) => item.provider === nextProvider
                          );
                        const nextModel = providerDetails[0]?.model ?? "";

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
                        <SelectValue
                          placeholder={
                            providerOptions.length === 0
                              ? "No active providers configured"
                              : "Select AI Provider"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {providerOptions.length === 0 ? (
                          <div className="pp:p-3 pp:text-muted-foreground pp:text-xs">
                            No active providers configured yet. Configure a
                            provider in AI Providers or Self-Hosted.
                          </div>
                        ) : (
                          providerOptions.map((option) => (
                            <SelectGroup key={option.id}>
                              <SelectLabel>{option.group}</SelectLabel>
                              <SelectItem value={option.id}>
                                {option.name}
                              </SelectItem>
                            </SelectGroup>
                          ))
                        )}
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
                    <Select
                      disabled={modelOptions.length === 0}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        className="pp:w-full"
                        id="general-default-model"
                      >
                        <SelectValue
                          placeholder={
                            modelOptions.length === 0
                              ? "No active models configured"
                              : "Select AI Model"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions.length === 0 ? (
                          <div className="pp:p-3 pp:text-muted-foreground pp:text-xs">
                            No active models configured for this provider.
                          </div>
                        ) : (
                          modelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
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
