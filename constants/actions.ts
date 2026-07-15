import { Action } from "@/types";
import {
  ArrowLeftRight,
  BookOpen,
  Languages,
  Maximize2,
  MessageSquarePlus,
  Minimize2,
  RefreshCw,
  SpellCheck,
  TrendingUp,
} from "lucide-react"

export const actions: Action[] = [
  { id: "grammar", label: "Grammar", icon: SpellCheck },
  { id: "rewrite", label: "Rewrite", icon: RefreshCw },
  { id: "improve", label: "Improve", icon: TrendingUp },
  { id: "shorten", label: "Shorten", icon: Minimize2 },
  { id: "expand", label: "Expand", icon: Maximize2 },
  { id: "explain", label: "Explain", icon: BookOpen },
  { id: "summarize", label: "Summarize", icon: Languages },
  { id: "translate", label: "Translate", icon: ArrowLeftRight },
  { id: "continue", label: "Continue", icon: MessageSquarePlus },
]