import { z } from "zod";

export const writingActionSchema = z.enum([
  "fix-grammar",
  "rewrite",
  "improve",
  "shorten",
  "expand",
  "translate",
  "summarize",
  "explain",
  "continue",
]);

export type WritingAction = z.infer<typeof writingActionSchema>;

export const writingOutputSchema = z.object({
  action: writingActionSchema,
  explanation: z.string().optional(),
  language: z.string().optional(),
  original: z.string(),
  result: z.string(),
});

export type WritingOutput = z.infer<typeof writingOutputSchema>;
