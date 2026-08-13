import { executeStructuredWritingAction } from "@/features/providers/sdk";
import { getDecryptedAccessToken } from "@/features/providers/storage";
import type { ProviderAdapter } from "@/types";

export default defineUnlistedScript(() => {
  (
    window as unknown as {
      AI_SDK_LOG_WARNINGS?: boolean;
      __promptpen_createTransformersAdapter?: unknown;
    }
  ).AI_SDK_LOG_WARNINGS = false;

  (
    window as unknown as { __promptpen_createTransformersAdapter?: unknown }
  ).__promptpen_createTransformersAdapter = createTransformersAdapter;
});

export async function createTransformersAdapter(
  modelId: string
): Promise<ProviderAdapter> {
  const accessToken = await getDecryptedAccessToken("transformers");
  const { provider } = await import("@/features/providers/transformers/index");

  const model = provider.createModel({
    accessToken: accessToken ?? undefined,
    apiKey: "",
    model: modelId,
  });

  const { generateText } = await import("ai");

  return {
    model: modelId,
    provider: "transformers",
    runPrompt: async (
      input: string,
      systemPrompt?: string,
      abortSignal?: AbortSignal
    ) => {
      const { text } = await generateText({
        abortSignal,
        model,
        prompt: input,
        system: systemPrompt,
      });
      return text;
    },
    runWritingAction: async (
      action: string,
      text: string,
      targetLanguage?: string,
      abortSignal?: AbortSignal
    ) =>
      executeStructuredWritingAction(
        model,
        action,
        text,
        targetLanguage,
        "transformers",
        abortSignal
      ),
  };
}
