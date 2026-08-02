import { storage } from "@wxt-dev/storage";
import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { getThemeChangeTarget } from "@/features/storage/theme-sync";
import type { Theme } from "@/types";

const THEME_KEY = "sync:promptpen-theme";
const RAW_THEME_KEY = "promptpen-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyThemeToDocument(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const stored = await browser.storage.sync.get(RAW_THEME_KEY);
        if (!mounted) {
          return;
        }
        const initial =
          (stored[RAW_THEME_KEY] as Theme | undefined) ?? "system";
        setThemeState(initial);
        applyThemeToDocument(initial);
      } catch {
        if (mounted) {
          setThemeState("system");
          applyThemeToDocument("system");
        }
      }
    }

    void init();

    const target = getThemeChangeTarget();
    function handleThemeChange(event: Event) {
      if (!mounted) {
        return;
      }
      const newTheme = (event as CustomEvent).detail as Theme | undefined;
      if (!newTheme) {
        return;
      }
      setThemeState(newTheme);
      applyThemeToDocument(newTheme);
    }
    target.addEventListener("change", handleThemeChange);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    function handleSystemChange() {
      setThemeState((current) => {
        if (current === "system") {
          applyThemeToDocument("system");
        }
        return current;
      });
    }
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mounted = false;
      target.removeEventListener("change", handleThemeChange);
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeToDocument(next);
    void storage.setItem(THEME_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolveTheme(theme) === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { resolved: resolveTheme(theme), setTheme, theme, toggleTheme };
}
