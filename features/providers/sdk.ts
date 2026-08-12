import {
  ACTION_INSTRUCTIONS,
  mapActionIdToWritingAction,
} from "@/constants/actions";
import type {
  AIProvider,
  ProviderAdapter,
  ProviderTestResult,
  WritingOutput,
} from "@/types";
import { writingOutputSchema } from "@/types/writing";
import { getCloudProviderModule, getProviderModule } from "./registry";
import { getRuntimeConfig } from "./storage";

export function parseOrFallbackWritingOutput(
  rawText: string,
  canonicalAction: string,
  originalText: string
): WritingOutput {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Try direct JSON parsing
  try {
    const rawJson = JSON.parse(cleaned);
    const validated = writingOutputSchema.parse(rawJson) as WritingOutput;
    if (validated.result && validated.result.trim()) {
      return {
        action: validated.action || canonicalAction,
        explanation: validated.explanation,
        language: validated.language,
        original: validated.original || originalText,
        result: validated.result,
      };
    }
  } catch {
    // If direct JSON fails, search for embedded JSON object block
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const rawJson = JSON.parse(jsonMatch[0]);
        const validated = writingOutputSchema.parse(rawJson) as WritingOutput;
        if (validated.result && validated.result.trim()) {
          return {
            action: validated.action || canonicalAction,
            explanation: validated.explanation,
            language: validated.language,
            original: validated.original || originalText,
            result: validated.result,
          };
        }
      } catch {
        // Fall through to plain text output handling
      }
    }
  }

  // Plain text fallback for local / small models that do not return JSON
  let plainResult = cleaned
    .replace(/^(?:Here is|Here's|The rewritten text is|Result:)\s*/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();

  if (!plainResult) {
    plainResult = cleaned;
  }

  return {
    action: canonicalAction,
    original: originalText,
    result: plainResult,
  };
}

export async function executeStructuredWritingAction(
  model: Parameters<typeof import("ai").generateText>[0]["model"],
  actionId: string,
  text: string,
  targetLanguage?: string,
  providerName?: string
): Promise<WritingOutput> {
  const canonicalAction = mapActionIdToWritingAction(actionId);
  const actionInstruction =
    ACTION_INSTRUCTIONS[canonicalAction] ?? "Process the text as requested.";

  const isTransformers =
    providerName === "transformers" ||
    (model as unknown as { provider?: string })?.provider === "transformers";

  const { generateObject, generateText } = await import("ai");

  // For in-browser Transformers.js models, skip generateObject (object-json mode is not supported by WASM wrapper)
  if (isTransformers) {
    const simpleSystemPrompt =
      "You are a helpful text transformation assistant. Transform the text as requested. Output ONLY the transformed text directly — no explanations, no commentary, no quotes.";

    const simpleUserPrompt = `Task: ${actionInstruction}
Original Text: "${text}"
${targetLanguage ? `Target Language: "${targetLanguage}"` : ""}
Transformed Text:`;

    const { text: rawText } = await generateText({
      model,
      prompt: simpleUserPrompt,
      system: simpleSystemPrompt,
    });

    const parsedOutput = parseOrFallbackWritingOutput(
      rawText,
      canonicalAction,
      text
    );

    if (!parsedOutput.result || !parsedOutput.result.trim()) {
      throw new Error("Local AI returned an empty result.");
    }

    return parsedOutput;
  }

  const systemPrompt = `You are PromptPen, an AI writing assistant.

The application has already selected the writing action.
You MUST perform only the supplied action.
Do not choose a different action.
Do not invent another action.
Do not modify the user's intent unless the requested action requires it.
For rewriting actions, preserve the original meaning.
For editing actions, return text that can be directly inserted into the editor.
Do not add introductions.
Do not add unnecessary explanations.
Do not wrap the result in quotes.
The \`original\` field must exactly match the input text.
The \`action\` field must exactly match the application-provided action.
The \`result\` field must contain the final usable result.`;

  const userPrompt = `Action: "${canonicalAction}"
Action Instruction: ${actionInstruction}
Original Text: "${text}"
${targetLanguage ? `Target Language: "${targetLanguage}"` : ""}`;

  let parsedOutput: WritingOutput | null = null;

  // Layer 1: Try Vercel AI SDK generateObject for cloud/Ollama providers
  try {
    const { object } = await generateObject({
      model,
      prompt: userPrompt,
      schema: writingOutputSchema,
      system: systemPrompt,
    });
    parsedOutput = object as WritingOutput;
  } catch (objectError) {
    console.warn(
      "generateObject failed, falling back to generateText with JSON / text parsing:",
      objectError
    );

    // Layer 2: Fallback to generateText with JSON prompt instructions
    const jsonSystemPrompt = `${systemPrompt}

IMPORTANT: You MUST respond ONLY with a valid JSON object matching this exact schema:
{
  "action": "${canonicalAction}",
  "original": ${JSON.stringify(text)},
  "result": "The final processed writing result here",
  "explanation": "Optional brief explanation"
}`;

    const { text: rawText } = await generateText({
      model,
      prompt: userPrompt,
      system: jsonSystemPrompt,
    });

    parsedOutput = parseOrFallbackWritingOutput(rawText, canonicalAction, text);
  }

  if (!parsedOutput) {
    throw new Error("Failed to generate writing output.");
  }

  if (!(parsedOutput.result && parsedOutput.result.trim())) {
    throw new Error("AI returned an empty result.");
  }

  if (!parsedOutput.original) {
    parsedOutput.original = text;
  }

  if (!parsedOutput.action) {
    parsedOutput.action = canonicalAction;
  }

  return parsedOutput;
}

export async function createCloudProviderAdapter(
  provider?: AIProvider,
  modelOverride?: string
): Promise<ProviderAdapter | null> {
  if (!provider || provider === "transformers") {
    return null;
  }
  const config = await getRuntimeConfig(provider);
  if (!config || config.provider === "transformers") {
    return null;
  }

  const resolvedModel = modelOverride?.trim() || config.model;
  const mod = await getCloudProviderModule(config.provider);
  const model = mod.createModel({
    accessToken: config.accessToken,
    apiKey: config.apiKey,
    model: resolvedModel,
  });

  const { generateText } = await import("ai");

  return {
    model: resolvedModel,
    provider: config.provider,
    runPrompt: async (input: string, systemPrompt?: string) => {
      const { text } = await generateText({
        model,
        prompt: input,
        system: systemPrompt,
      });
      return text;
    },
    runWritingAction: async (
      action: string,
      text: string,
      targetLanguage?: string
    ) =>
      executeStructuredWritingAction(
        model,
        action,
        text,
        targetLanguage,
        config.provider
      ),
  };
}

export async function createProviderAdapter(
  provider?: AIProvider,
  modelOverride?: string
): Promise<ProviderAdapter | null> {
  const config = await getRuntimeConfig(provider);
  if (!config) {
    return null;
  }

  const resolvedModel = modelOverride?.trim() || config.model;
  const mod = await getProviderModule(config.provider);
  const model = mod.createModel({
    accessToken: config.accessToken,
    apiKey: config.apiKey,
    model: resolvedModel,
  });

  const { generateText } = await import("ai");

  return {
    model: resolvedModel,
    provider: config.provider,
    runPrompt: async (input: string, systemPrompt?: string) => {
      const { text } = await generateText({
        model,
        prompt: input,
        system: systemPrompt,
      });
      return text;
    },
    runWritingAction: async (
      action: string,
      text: string,
      targetLanguage?: string
    ) =>
      executeStructuredWritingAction(
        model,
        action,
        text,
        targetLanguage,
        config.provider
      ),
  };
}

export async function testProviderConnectionWithValues(
  provider: AIProvider,
  model: string,
  apiKey: string,
  baseUrl?: string
): Promise<ProviderTestResult> {
  try {
    const { generateText } = await import("ai");
    const mod = await getProviderModule(provider);
    const client = mod.createModel({ apiKey, baseUrl, model });

    await generateText({
      abortSignal: AbortSignal.timeout(15_000),
      model: client,
      prompt: "Reply with exactly one word: ready",
      system: "You are a connection test assistant.",
    });
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown provider error.";
    return { message, ok: false };
  }
}
