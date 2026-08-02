import { storage } from "@wxt-dev/storage";
import type { CustomPromptDefinition } from "@/types";

const STORAGE_KEY = "promptpen.custom-prompts.v1";

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

async function readPrompts(): Promise<CustomPromptDefinition[]> {
  return (
    (await storage.getItem<CustomPromptDefinition[]>(`local:${STORAGE_KEY}`)) ??
    []
  );
}

async function writePrompts(prompts: CustomPromptDefinition[]): Promise<void> {
  await storage.setItem(`local:${STORAGE_KEY}`, prompts);
}

export async function getCustomPrompts(): Promise<CustomPromptDefinition[]> {
  const prompts = await readPrompts();
  return prompts.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveCustomPrompt(
  title: string,
  prompt: string
): Promise<void> {
  const normalizedTitle = title.trim();
  const normalizedPrompt = prompt.trim();
  if (!(normalizedTitle && normalizedPrompt)) {
    return;
  }

  const prompts = await readPrompts();
  prompts.unshift({
    id: createId(),
    prompt: normalizedPrompt,
    title: normalizedTitle,
    updatedAt: Date.now(),
  });
  await writePrompts(prompts);
}

export async function removeCustomPrompt(promptId: string): Promise<void> {
  const prompts = await readPrompts();
  await writePrompts(prompts.filter((prompt) => prompt.id !== promptId));
}

export async function updateCustomPrompt(
  promptId: string,
  title: string,
  prompt: string
): Promise<void> {
  const prompts = await readPrompts();
  const index = prompts.findIndex((item) => item.id === promptId);
  if (index < 0) {
    return;
  }

  const normalizedTitle = title.trim();
  const normalizedPrompt = prompt.trim();
  if (!(normalizedTitle && normalizedPrompt)) {
    return;
  }

  prompts[index] = {
    ...prompts[index],
    prompt: normalizedPrompt,
    title: normalizedTitle,
    updatedAt: Date.now(),
  };

  await writePrompts(prompts);
}
