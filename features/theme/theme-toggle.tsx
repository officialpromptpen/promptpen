import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
export { useTheme } from "next-themes"

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

const next = {
  light: "dark" as const,
  dark: "system" as const,
  system: "light" as const,
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const resolved = theme ?? "system"
  const Icon = icons[resolved as keyof typeof icons]
  const label = labels[resolved as keyof typeof labels]

  function changeTheme() {
    setTheme(next[resolved as keyof typeof next])
  }

  return (
    <Button variant="ghost" size="icon" onClick={changeTheme} aria-label={label} title={label}>
      <Icon className="size-4" />
    </Button>
  )
}
