import { getActionById } from "@/constants/actions";
import {
  type WritingAction,
  type WritingOutput,
  writingActionSchema,
} from "./schema";

export const ACTION_INSTRUCTIONS: Record<WritingAction, string> = {
  continue:
    "Continue the text naturally from where it ends. Match its existing tone, style, and context.",
  expand:
    "Expand the text with useful detail while preserving the original meaning and intent.",
  explain:
    "Explain the meaning of the selected text clearly. Do not rewrite the original text.",
  "fix-grammar":
    "Fix grammar, spelling, punctuation, and obvious language mistakes. Preserve the original meaning and style.",
  improve:
    "Improve clarity, readability, wording, and overall quality while preserving the original meaning.",
  rewrite:
    "Rewrite the text to make it clearer and more natural while preserving the original meaning.",
  shorten:
    "Make the text shorter and more concise while preserving the important meaning.",
  summarize:
    "Summarize the text clearly and concisely while keeping the most important information.",
  translate:
    "Translate the text into the requested target language while preserving meaning and tone.",
};

export function mapToWritingAction(actionId: string): WritingAction {
  const options = writingActionSchema.options;
  if (options.includes(actionId as WritingAction)) {
    return actionId as WritingAction;
  }
  if (actionId.includes("grammar") || actionId.includes("spelling")) {
    return "fix-grammar";
  }
  if (actionId.includes("shorten")) {
    return "shorten";
  }
  if (actionId.includes("expand")) {
    return "expand";
  }
  if (actionId.includes("summarize")) {
    return "summarize";
  }
  if (actionId.includes("explain")) {
    return "explain";
  }
  if (actionId.includes("continue")) {
    return "continue";
  }
  if (actionId.includes("translate")) {
    return "translate";
  }
  if (actionId.includes("rewrite")) {
    return "rewrite";
  }
  return "improve";
}

export function buildWritingPrompt({
  actionId,
  text,
  customPrompt,
  targetLanguage,
}: {
  actionId: string;
  text: string;
  customPrompt?: string;
  targetLanguage?: string;
}) {
  const writingAction = mapToWritingAction(actionId);
  const baseInstruction = ACTION_INSTRUCTIONS[writingAction];

  let extraGuidance = "";
  if (actionId === "custom-prompt" && customPrompt?.trim()) {
    extraGuidance += `\nCustom Requirement: ${customPrompt.trim()}`;
  } else {
    const actionDef = getActionById(actionId);
    if (actionDef?.prompt) {
      extraGuidance += `\nAction Specific Requirement: ${actionDef.prompt}`;
    }
  }

  if (writingAction === "translate" && targetLanguage?.trim()) {
    extraGuidance += `\nTarget Language: ${targetLanguage.trim()}`;
  }

  let continueNote = "";
  if (writingAction === "continue") {
    continueNote =
      "\nNote for continue action: Do NOT repeat the input text in the `result` field. Return ONLY the new continuation text.";
  }

  const prompt = `Requested Writing Action: "${writingAction}"
Base Action Instruction: ${baseInstruction}${extraGuidance}

Input Text:
"""
${text}
"""${continueNote}`;

  const system = `You are a text transformation engine for PromptPen.

The application has specified the writing action: "${writingAction}".

CRITICAL OUTPUT RULES:
- Return ONLY the transformed result text directly.
- NEVER include greetings, introductory phrases (e.g. "Sure!", "Here is the revised text:"), or concluding remarks.
- NEVER self-identify or introduce yourself (e.g. NEVER say "I am PromptPen", "As an AI language model", etc.).
- NEVER add meta-commentary about the original text quality (e.g. NEVER say "The original text is perfectly formatted" or "No changes needed").
- If the input text already satisfies the requested action or requires no changes, return the input text directly as the result without any extra words.
- Do not wrap the output in unnecessary quotes or Markdown code blocks unless specifically requested.

For structured output:
- The \`original\` field must exactly match the input text.
- The \`action\` field must exactly match "${writingAction}".
- The \`result\` field must contain ONLY the transformed usable text.`;

  const plainSystem =
    "You are a text transformation engine. Return ONLY the transformed result text directly. Do NOT include greetings, intro phrases, rules, self-identifications, or commentary.";

  const plainPrompt = `Task: ${baseInstruction}${extraGuidance}\n\nOriginal Text:\n"${text}"\n\nTransformed Output:\n`;

  const directPrompt = `${baseInstruction}${extraGuidance ? ` (${extraGuidance.trim()})` : ""}: "${text}"`;

  return {
    directPrompt,
    plainPrompt,
    plainSystem,
    prompt,
    system,
    writingAction,
  };
}

export function validateWritingOutput(
  output: WritingOutput,
  requestedAction: WritingAction
): void {
  if (output.action !== requestedAction) {
    throw new Error(
      `AI returned incorrect action. Expected "${requestedAction}", received "${output.action}".`
    );
  }

  if (!(output.result && output.result.trim())) {
    throw new Error("AI returned an empty result.");
  }
}
