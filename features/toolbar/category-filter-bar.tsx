import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { CategoryFilterBarProps } from "@/types";

export function CategoryFilterBar({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterBarProps) {
  return (
    <ScrollArea className="pp:max-w-full">
      <div className="pp:flex pp:flex-nowrap pp:gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            size="sm"
            title={`Filter by ${category.label} actions`}
            variant={activeCategory === category.id ? "secondary" : "ghost"}
          >
            {category.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
