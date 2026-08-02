import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./hooks/use-theme";

export function ThemeToggle() {
  const { resolved, toggleTheme } = useTheme();

  return (
    <Button
      aria-label={
        resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      onClick={toggleTheme}
      size="icon"
      title={
        resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      variant="ghost"
    >
      {resolved === "dark" ? (
        <Sun className="pp:size-4" />
      ) : (
        <Moon className="pp:size-4" />
      )}
    </Button>
  );
}
