import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const labels = {
  light: "Light mode",
  dark: "Dark mode",
  system: "System theme",
}



export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const resolved = theme ?? "system"
  const Icon = icons[resolved as keyof typeof icons]
  const label = labels[resolved as keyof typeof labels]

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={label} title={label}>
      <Icon className="pp:size-4" />
    </Button>
  )
}
