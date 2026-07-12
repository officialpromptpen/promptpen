import { motion } from "framer-motion"
import { Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const recentPrompts = [
  { id: "1", label: "Fix grammar and spelling" },
  { id: "2", label: "Make this more professional" },
  { id: "3", label: "Summarize this text" },
] as const

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
}

export function RecentPrompts() {
  return (
    <motion.section variants={item} aria-label="Recent prompts">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="size-3 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Recent Prompts</span>
      </div>
      <div className="flex flex-col gap-1">
        {recentPrompts.map((prompt) => (
          <Button
            key={prompt.id}
            variant="ghost"
            size="sm"
            className="justify-start gap-2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            aria-label={prompt.label}
          >
            <Sparkles className="size-3 shrink-0" />
            <span className="truncate">{prompt.label}</span>
          </Button>
        ))}
      </div>
    </motion.section>
  )
}
