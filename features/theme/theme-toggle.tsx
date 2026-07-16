import { Monitor, Moon, Sun } from "lucide-react"
import { storage } from "@wxt-dev/storage"
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
  const { theme, resolvedTheme, setTheme } = useTheme()
  const currentTheme = theme ?? "system"
  const activeTheme = (currentTheme === "system" ? resolvedTheme : currentTheme) ?? "light"
  const Icon = icons[currentTheme as keyof typeof icons]
  const label = labels[currentTheme as keyof typeof labels]

  const handleThemeToggle = () => {
    const nextTheme = activeTheme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    void storage.setItem("local:theme", nextTheme)
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleThemeToggle} aria-label={label} title={label}>
      <Icon className="pp:size-4" />
    </Button>
  )
}
