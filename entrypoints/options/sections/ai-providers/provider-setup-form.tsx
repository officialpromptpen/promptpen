import { Loader2, PlusCircle, Save, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
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
import type { PopularModel } from "@/constants/ai-providers/popular-models";
import { ProviderIcon } from "@/features/providers/provider-icons";
import {
  CATEGORY_LABELS,
  getProviderDefinition,
  PROVIDER_DEFINITIONS,
} from "@/features/providers/registry";
import { testProviderConnectionWithValues } from "@/features/providers/sdk";
import {
  getDecryptedApiKey,
  getProviderEditorState,
  recordProviderConnectionTest,
  saveProviderConfig,
  setDefaultProvider,
} from "@/features/providers/storage";
import { cn } from "@/lib/utils";
import type { AIProvider, OptionsState, ProviderCategory } from "@/types";
import { StatusNotice } from "../shared/section-shell";

interface ProviderSetupFormProps {
  onQuickAddHandled: () => void;
  pendingQuickAdd: PopularModel | null;
  state: OptionsState;
}

interface ProviderSetupFormValues {
  apiKey: string;
  makeDefault: boolean;
  model: string;
  provider: AIProvider;
}

type ProviderStatus = "error" | "idle" | "success";

const PROVIDER_GROUPS = PROVIDER_DEFINITIONS.filter(
  (provider) => provider.category !== "self-hosted"
).reduce(
  (groups, provider) => {
    const category =
      CATEGORY_LABELS[
        (provider.category ?? "openai-compatible") as ProviderCategory
      ];
    const existing = groups.find((group) => group.key === category);
    if (existing) {
      existing.providers.push(provider);
      return groups;
    }
    groups.push({
      key: category,
      label: category,
      providers: [provider],
    });
    return groups;
  },
  [] as Array<{
    key: string;
    label: string;
    providers: typeof PROVIDER_DEFINITIONS;
  }>
);

export function ProviderSetupForm({
  onQuickAddHandled,
  pendingQuickAdd,
  state,
}: ProviderSetupFormProps) {
  const [hasStoredApiKey, setHasStoredApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestPassed, setIsTestPassed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<ProviderStatus>("idle");

  const [savedModels, setSavedModels] = useState<string[]>([]);

  const form = useForm<ProviderSetupFormValues>({
    defaultValues: {
      apiKey: "",
      makeDefault:
        state.settings.defaultProvider === state.selectedProvider ||
        state.providerSummary?.defaultProvider === state.selectedProvider,
      model: getProviderDefinition(state.selectedProvider).defaultModel,
      provider: state.selectedProvider,
    },
    mode: "onChange",
  });

  const selectedProvider = form.watch("provider");
  const selectedModel = form.watch("model");
  const formApiKey = form.watch("apiKey");

  const modelChoices = useMemo(
    () => PROVIDER_MODEL_PRESETS[selectedProvider] ?? [],
    [selectedProvider]
  );

  useEffect(() => {
    setIsTestPassed(false);
  }, [selectedProvider, selectedModel, formApiKey]);

  useEffect(() => {
    if (state.selectedProvider !== selectedProvider) {
      form.setValue("provider", state.selectedProvider);
    }
  }, [form, selectedProvider, state.selectedProvider]);

  useEffect(() => {
    let mounted = true;

    async function syncProviderEditorState() {
      const [editorState, existingApiKey] = await Promise.all([
        getProviderEditorState(selectedProvider),
        getDecryptedApiKey(selectedProvider),
      ]);

      if (!mounted) {
        return;
      }

      const quickAddOverride =
        pendingQuickAdd?.provider === selectedProvider
          ? pendingQuickAdd.modelId
          : undefined;

      setHasStoredApiKey(editorState.hasApiKey);
      setSavedModels(editorState.models ?? []);
      setStatusType("idle");
      setStatusMessage("");
      setIsTestPassed(false);
      form.reset({
        apiKey: existingApiKey ?? "",
        makeDefault:
          state.settings.defaultProvider === selectedProvider ||
          state.providerSummary?.defaultProvider === selectedProvider,
        model: quickAddOverride ?? editorState.model,
        provider: selectedProvider,
      });

      if (quickAddOverride) {
        onQuickAddHandled();
      }
    }

    void syncProviderEditorState();
    return () => {
      mounted = false;
    };
  }, [
    selectedProvider,
    pendingQuickAdd,
    form,
    onQuickAddHandled,
    state.settings.defaultProvider,
    state.providerSummary?.defaultProvider,
  ]);

  async function handleTestConnection(values: ProviderSetupFormValues) {
    setIsTesting(true);
    setStatusType("idle");
    setStatusMessage("");
    setIsTestPassed(false);

    const resolvedApiKey = values.apiKey.trim();
    if (!(resolvedApiKey || hasStoredApiKey)) {
      setIsTesting(false);
      setStatusType("error");
      setStatusMessage("Enter an API key before testing this provider.");
      return;
    }

    try {
      const apiKey =
        resolvedApiKey || (await getDecryptedApiKey(values.provider)) || "";
      const result = await testProviderConnectionWithValues(
        values.provider,
        values.model.trim(),
        apiKey
      );

      await recordProviderConnectionTest(values.provider, result.ok);
      await state.refreshProviderData();

      if (result.ok) {
        setIsTestPassed(true);
        setStatusType("success");
        setStatusMessage(
          "Connection test successful! You can now click Save Provider."
        );
      } else {
        setIsTestPassed(false);
        setStatusType("error");
        setStatusMessage(
          result.message
            ? `Connection test failed: ${result.message}`
            : "Connection test failed. Check your API key and model ID."
        );
      }
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Connection test failed unexpectedly.";
      setIsTestPassed(false);
      setStatusType("error");
      setStatusMessage(`Connection test error: ${msg}`);
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSaveProvider(values: ProviderSetupFormValues) {
    if (!isTestPassed) {
      setStatusType("error");
      setStatusMessage("Please test connection successfully before saving.");
      return;
    }

    setIsSaving(true);
    setStatusType("idle");
    setStatusMessage("");

    try {
      const trimmedModel = values.model.trim();
      if (!trimmedModel) {
        setStatusType("error");
        setStatusMessage("Model ID is required.");
        setIsSaving(false);
        return;
      }

      const resolvedApiKey = values.apiKey.trim();
      if (!(resolvedApiKey || hasStoredApiKey)) {
        setStatusType("error");
        setStatusMessage("API key is required to save provider.");
        setIsSaving(false);
        return;
      }

      await saveProviderConfig(values.provider, trimmedModel, resolvedApiKey);
      await recordProviderConnectionTest(values.provider, true);

      if (values.makeDefault) {
        await setDefaultProvider(values.provider);
        state.setSettings((previous) => ({
          ...previous,
          defaultModel: trimmedModel,
          defaultProvider: values.provider,
        }));
      }

      setHasStoredApiKey(true);
      await state.refreshProviderData();

      setStatusType("success");
      setStatusMessage(
        values.makeDefault
          ? "Provider saved and set as default!"
          : "Provider saved successfully!"
      );
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Unable to save provider settings.";
      setStatusType("error");
      setStatusMessage(`Save error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="pp:rounded-xl pp:border pp:bg-card pp:p-6 pp:shadow-sm">
      <div className="pp:mb-6 pp:border-border/60 pp:border-b pp:pb-4">
        <h2 className="pp:flex pp:items-center pp:gap-2.5 pp:font-semibold pp:text-foreground pp:text-lg">
          <PlusCircle className="pp:size-5 pp:text-emerald-600 dark:pp:text-emerald-400" />
          Add New Provider
        </h2>
      </div>

      <form
        className="pp:space-y-5"
        onSubmit={form.handleSubmit(handleSaveProvider)}
      >
        <div
          className="pp:grid pp:gap-4 sm:pp:grid-cols-2"
          id="pp-tour-provider-list"
        >
          <div className="pp:space-y-1.5">
            <Label
              className="pp:font-bold pp:text-[11px] pp:text-muted-foreground pp:uppercase pp:tracking-wider"
              htmlFor="provider-service"
            >
              PROVIDER SERVICE
            </Label>
            <Controller
              control={form.control}
              name="provider"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value as AIProvider);
                    state.setSelectedProvider(value as AIProvider);
                  }}
                  value={field.value}
                >
                  <SelectTrigger
                    className="pp:h-10 pp:w-full pp:rounded-lg pp:border-input pp:bg-background"
                    id="provider-service"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_GROUPS.map((group) => (
                      <SelectGroup key={group.key}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div className="pp:flex pp:items-center pp:gap-2">
                              <ProviderIcon
                                className="pp:size-4"
                                provider={provider.id}
                              />
                              <span>{provider.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="pp:space-y-1.5" id="pp-tour-model-field">
            <Label
              className="pp:font-bold pp:text-[11px] pp:text-muted-foreground pp:uppercase pp:tracking-wider"
              htmlFor="provider-model"
            >
              MODEL ID
            </Label>
            <Controller
              control={form.control}
              name="model"
              render={({ field }) => (
                <Input
                  className="pp:h-10 pp:rounded-lg"
                  id="provider-model"
                  onChange={field.onChange}
                  placeholder={
                    getProviderDefinition(selectedProvider).defaultModel
                  }
                  value={field.value}
                />
              )}
            />
            {modelChoices.length > 0 && (
              <div className="pp:flex pp:flex-wrap pp:gap-2 pp:pt-1">
                {modelChoices.map((choice) => {
                  const active = selectedModel === choice.value;
                  return (
                    <button
                      className={cn(
                        "pp:rounded-full pp:border pp:px-2.5 pp:py-1 pp:text-xs pp:transition",
                        active
                          ? "pp:border-primary pp:bg-primary/10 pp:text-primary"
                          : "pp:border-border pp:bg-background hover:pp:bg-accent"
                      )}
                      key={choice.value}
                      onClick={() =>
                        form.setValue("model", choice.value, {
                          shouldDirty: true,
                        })
                      }
                      type="button"
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            )}
            {savedModels.length > 0 && (
              <div className="pp:pt-2">
                <span className="pp:mb-1 pp:block pp:font-medium pp:text-[11px] pp:text-muted-foreground">
                  Configured models for{" "}
                  {getProviderDefinition(selectedProvider).label}:
                </span>
                <div className="pp:flex pp:flex-wrap pp:gap-1.5">
                  {savedModels.map((m) => {
                    const active = selectedModel === m;
                    return (
                      <button
                        className={cn(
                          "pp:rounded-md pp:border pp:px-2.5 pp:py-1 pp:text-xs pp:transition-colors",
                          active
                            ? "pp:border-primary pp:bg-primary/10 pp:font-semibold pp:text-primary"
                            : "pp:border-border pp:bg-background pp:text-muted-foreground hover:pp:bg-accent"
                        )}
                        key={m}
                        onClick={() =>
                          form.setValue("model", m, { shouldDirty: true })
                        }
                        type="button"
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pp:space-y-1.5" id="pp-tour-api-key-field">
          <Label
            className="pp:font-bold pp:text-[11px] pp:text-muted-foreground pp:uppercase pp:tracking-wider"
            htmlFor="provider-api-key"
          >
            API KEY
          </Label>
          <Controller
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <PasswordInput
                className="pp:h-10 pp:rounded-lg"
                id="provider-api-key"
                onChange={field.onChange}
                placeholder={
                  hasStoredApiKey
                    ? "Leave empty to keep existing key"
                    : "Enter your API key"
                }
                value={field.value}
              />
            )}
          />
        </div>

        {statusType !== "idle" && (
          <StatusNotice
            icon={
              statusType === "success" ? (
                <Save className="pp:h-4 pp:w-4 pp:shrink-0" />
              ) : (
                <Wifi className="pp:h-4 pp:w-4 pp:shrink-0" />
              )
            }
            message={statusMessage}
            tone={statusType}
          />
        )}

        <div className="pp:flex pp:justify-end pp:gap-3 pp:pt-2">
          <Button
            className="pp:gap-2 pp:rounded-lg pp:px-4"
            disabled={isTesting}
            id="pp-tour-test-btn"
            onClick={form.handleSubmit(handleTestConnection)}
            type="button"
            variant="outline"
          >
            {isTesting ? (
              <Loader2 className="pp:size-4 pp:animate-spin" />
            ) : (
              <Wifi className="pp:size-4" />
            )}
            Test Connection
          </Button>
          <Button
            className="pp:gap-2"
            disabled={!isTestPassed || isSaving}
            id="pp-tour-save-btn"
            title={
              isTestPassed
                ? "Save Provider"
                : "Test connection successfully first before saving"
            }
            type="submit"
          >
            {isSaving ? (
              <Loader2 className="pp:size-4 pp:animate-spin" />
            ) : (
              <Save className="pp:size-4" />
            )}
            Save Provider
          </Button>
        </div>
      </form>
    </div>
  );
}
