import { motion } from "framer-motion"
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
import type { ElementType } from "react"
import { Button } from "@/components/ui/button"

interface Action {
  id: string
  label: string
  icon: ElementType
}

const actions: Action[] = [
  { id: "grammar", label: "Grammar", icon: SpellCheck },
  { id: "rewrite", label: "Rewrite", icon: RefreshCw },
  { id: "improve", label: "Improve", icon: TrendingUp },
  { id: "shorten", label: "Shorten", icon: Minimize2 },
  { id: "expand", label: "Expand", icon: Maximize2 },
  { id: "continue", label: "Continue", icon: MessageSquarePlus },
  { id: "explain", label: "Explain", icon: BookOpen },
  { id: "summarize", label: "Summarize", icon: Languages },
  { id: "translate", label: "Translate", icon: ArrowLeftRight },
]

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <motion.div key={action.id} variants={item}>
              <Button
                variant="outline"
                size="sm"
                className="flex w-full flex-col gap-1 h-16 py-2 px-1 text-xs text-muted-foreground hover:text-foreground"
                aria-label={action.label}
              >
                <Icon className="size-4 shrink-0" />
                <span>{action.label}</span>
              </Button>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
