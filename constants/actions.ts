
import {
  BookOpen,
  CaseSensitive,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Heading,
  HelpCircle,
  Languages,
  Lightbulb,
  List,
  ListOrdered,
  ListPlus,
  Maximize2,
  MessageCircleHeart,
  MessageCircleMore,
  Minimize2,
  NotebookPen,
  PartyPopper,
  PenLine,
  RefreshCw,
  Scale,
  ScanText,
  SearchCode,
  Sparkles,
  SpellCheck,
  SquarePen,
  StretchHorizontal,
  Tag,
  Target,
  TrendingUp,
  Type,
  WandSparkles,
  Zap,
} from "lucide-react";
import type { Action, ActionCategory } from "@/types";

export const ACTION_CATEGORY_ORDER: ActionCategory[] = [
  "rewrite",
  "modify",
  "tone",
  "transform",
  "blog",
];

export const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
  "blog": "Blog",
  modify: "Modify",
  rewrite: "Rewrite",
  tone: "Tone",
  transform: "Transform",
};

export const actions: Action[] = [
  {
    category: "rewrite",
    icon: TrendingUp,
    id: "improve-writing",
    label: "Improve writing",
    prompt:
      "Improve writing quality, clarity, and flow while preserving intent.",
  },
  {
    category: "rewrite",
    icon: SpellCheck,
    id: "fix-spelling-grammar",
    label: "Fix spelling and grammar",
    prompt:
      "Fix spelling, grammar, punctuation, and basic style while preserving meaning.",
  },
  {
    category: "rewrite",
    icon: SquarePen,
    id: "rewrite-single-sentence",
    label: "Rewrite as a single sentence",
    prompt: "Rewrite the text as one clear, grammatically correct sentence.",
  },
  {
    category: "rewrite",
    icon: Languages,
    id: "convert-english-us",
    label: "Convert to English (US)",
    prompt: "Convert the text to natural, fluent American English.",
  },
  {
    category: "rewrite",
    icon: WandSparkles,
    id: "simplify-language",
    label: "Simplify language",
    prompt: "Simplify wording and sentence structure for easier understanding.",
  },
  {
    category: "rewrite",
    icon: FileText,
    id: "rewrite-single-paragraph",
    label: "Rewrite into a single paragraph",
    prompt: "Rewrite the text as one coherent paragraph.",
  },
  {
    category: "rewrite",
    icon: ChevronRight,
    id: "continue-writing",
    label: "Continue writing",
    prompt: "Continue the text naturally in the same tone, style, and context.",
  },
  {
    category: "modify",
    icon: Minimize2,
    id: "shorten-selection",
    label: "Shorten selection",
    prompt: "Make the text shorter while preserving the key meaning.",
  },
  {
    category: "modify",
    icon: Maximize2,
    id: "expand-selection",
    label: "Expand selection",
    prompt: "Expand the text with useful detail while preserving intent.",
  },
  {
    category: "modify",
    icon: ScanText,
    id: "summarize-selection",
    label: "Summarize selection",
    prompt: "Summarize the text into concise key points.",
  },
  {
    category: "modify",
    icon: BookOpen,
    id: "explain-selection",
    label: "Explain selection",
    prompt: "Explain the text in plain, simple language.",
  },
  {
    category: "tone",
    icon: MessageCircleHeart,
    id: "tone-friendly",
    label: "Write in friendly tone",
    prompt: "Rewrite the text in a friendly, approachable tone.",
  },
  {
    category: "tone",
    icon: MessageCircleMore,
    id: "tone-casual",
    label: "Write in casual tone",
    prompt: "Rewrite the text in a casual conversational tone.",
  },
  {
    category: "tone",
    icon: NotebookPen,
    id: "tone-professional",
    label: "Write in professional tone",
    prompt: "Rewrite the text in a professional and polished tone.",
  },
  {
    category: "tone",
    icon: PartyPopper,
    id: "tone-excited",
    label: "Write in excited tone",
    prompt: "Rewrite the text in an excited and energetic tone.",
  },
  {
    category: "tone",
    icon: Target,
    id: "tone-confident",
    label: "Write in confident tone",
    prompt: "Rewrite the text in a confident and assured tone.",
  },
  {
    category: "tone",
    icon: ClipboardCheck,
    id: "tone-appreciative",
    label: "Write in appreciative tone",
    prompt: "Rewrite the text in an appreciative and grateful tone.",
  },
  {
    category: "tone",
    icon: PenLine,
    id: "tone-direct",
    label: "Write in direct tone",
    prompt: "Rewrite the text to be direct, concise, and unambiguous.",
  },
  {
    category: "tone",
    icon: RefreshCw,
    id: "tone-regretful",
    label: "Write in regretful tone",
    prompt: "Rewrite the text in a regretful and apologetic tone.",
  },
  {
    category: "tone",
    icon: Sparkles,
    id: "tone-thoughtful",
    label: "Write in thoughtful tone",
    prompt: "Rewrite the text in a reflective and thoughtful tone.",
  },
  {
    category: "tone",
    icon: Scale,
    id: "tone-critical",
    label: "Write in a critical tone",
    prompt: "Rewrite the text in a critical and analytical tone.",
  },
  {
    category: "tone",
    icon: TrendingUp,
    id: "tone-hopeful",
    label: "Write in a hopeful tone",
    prompt: "Rewrite the text in a hopeful and uplifting tone.",
  },
  {
    category: "tone",
    icon: PartyPopper,
    id: "tone-surprised",
    label: "Write in a surprised tone",
    prompt: "Rewrite the text in a tone that conveys surprise.",
  },
  {
    category: "tone",
    icon: Sparkles,
    id: "tone-optimistic",
    label: "Write in an optimistic tone",
    prompt: "Rewrite the text in an optimistic, positive tone.",
  },
  {
    category: "tone",
    icon: BookOpen,
    id: "tone-curious",
    label: "Write in a curious tone",
    prompt: "Rewrite the text in an inquisitive and curious tone.",
  },
  {
    category: "tone",
    icon: StretchHorizontal,
    id: "tone-assertive",
    label: "Write in an assertive tone",
    prompt: "Rewrite the text in an assertive and decisive tone.",
  },
  {
    category: "tone",
    icon: CaseSensitive,
    id: "tone-informative",
    label: "Write in an informative tone",
    prompt: "Rewrite the text in an informative, neutral tone.",
  },
  {
    category: "transform",
    icon: List,
    id: "transform-bullets",
    label: "Turn into bullet list",
    prompt: "Transform the text into a clean bullet list.",
  },
  {
    category: "transform",
    icon: ListOrdered,
    id: "transform-numbered",
    label: "Turn into numbered list",
    prompt: "Transform the text into a numbered list.",
  },
  {
    category: "blog",
    icon: Type,
    id: "generate-1-blog-title",
    label: "Generate 1 Blog Title",
    prompt:
      "Generate 1 high-converting, catchy blog title based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: Lightbulb,
    id: "generate-3-blog-titles",
    label: "Generate 3 Blog Titles",
    prompt:
      "Generate 3 diverse, creative blog title options based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: Sparkles,
    id: "generate-5-blog-titles",
    label: "Generate 5 Blog Titles",
    prompt:
      "Generate 5 compelling, engaging blog title options based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: ListPlus,
    id: "generate-10-blog-titles",
    label: "Generate 10 Blog Titles",
    prompt:
      "Generate 10 diverse, high-performing blog title options based on the selected text or heading, numbered 1 to 10.",
  },
  {
    category: "blog",
    icon: SearchCode,
    id: "generate-seo-blog-titles",
    label: "Generate SEO Blog Titles",
    prompt:
      "Generate 5 SEO-optimized blog titles with high search intent keywords based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: Zap,
    id: "generate-clickbait-blog-titles",
    label: "Generate Catchy / Clickbait Titles",
    prompt:
      "Generate 5 high-CTR, curiosity-inducing, catchy blog titles based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: Tag,
    id: "generate-listicle-blog-titles",
    label: "Generate Listicle Blog Titles",
    prompt:
      "Generate 5 listicle-style blog titles (e.g. '10 Best...', '7 Proven Ways to...') based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: Heading,
    id: "generate-howto-blog-titles",
    label: "Generate How-To Blog Titles",
    prompt:
      "Generate 5 actionable 'How To' blog titles based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: HelpCircle,
    id: "generate-question-blog-titles",
    label: "Generate Question Blog Titles",
    prompt:
      "Generate 5 intriguing question-based blog titles that spark reader curiosity based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: SearchCode,
    id: "generate-5-seo-meta-descriptions",
    label: "Generate 5 SEO Meta Descriptions",
    prompt:
      "Generate 5 optimized SEO meta descriptions (150-160 characters each) based on the selected text or heading.",
  },
  {
    category: "blog",
    icon: FileText,
    id: "generate-seo-meta-title-desc",
    label: "Generate SEO Title & Meta Description Pairs",
    prompt:
      "Generate 5 pairs of SEO Title (50-60 characters) and Meta Description (150-160 characters) formatted cleanly based on the selected text or heading.",
  },
];

const actionLookup = new Map(actions.map((action) => [action.id, action]));

export function getActionById(actionId: string): Action | null {
  return actionLookup.get(actionId) ?? null;
}
