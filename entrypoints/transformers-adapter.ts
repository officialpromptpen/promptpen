import type { ProviderAdapter } from "@/types";
import { getDecryptedAccessToken } from "@/features/providers/storage";

export default defineUnlistedScript(() => {
  (window as unknown as { __promptpen_createTransformersAdapter?: unknown }).__promptpen_createTransformersAdapter =
    createTransformersAdapter;
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
    runPrompt: async (input: string, systemPrompt?: string) => {
      const { text } = await generateText({
        model,
        prompt: input,
        system: systemPrompt,
      });
      return text;
    },
  };
}
