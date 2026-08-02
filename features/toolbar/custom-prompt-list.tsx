import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CustomPromptListProps } from "@/types";

export function CustomPromptList({
  prompts,
  isLoading,
  onRun,
}: CustomPromptListProps) {
  if (prompts.length === 0) {
    return (
      <div className="pp:rounded-md pp:border pp:border-dashed pp:bg-background/70 pp:p-4 pp:text-muted-foreground pp:text-sm">
        No custom prompts saved yet. Add them from Dashboard &gt; Custom
        Prompts.
      </div>
    );
  }

  return (
    <ScrollArea className="pp:max-h-[52vh]">
      <div className="pp:space-y-3 pp:pr-1">
        {prompts.map((item) => (
          <Button
            className="pp:w-full pp:justify-start pp:gap-2 pp:rounded-md pp:px-2"
            disabled={isLoading}
            key={item.id}
            onClick={() => onRun(item)}
            size="default"
            variant="ghost"
          >
            <WandSparkles className="pp:size-3.5 pp:shrink-0" />
            <span className="pp:flex-1 pp:text-left">{item.title}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
