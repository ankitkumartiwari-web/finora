import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "../store/useAppStore";

export function ThemeSynchronizer() {
  const { setTheme, resolvedTheme } = useTheme();
  const storedTheme = useAppStore((state) => state.theme);
  const setThemePreference = useAppStore((state) => state.setTheme);

  useEffect(() => {
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storedTheme, setTheme]);

  useEffect(() => {
    if (resolvedTheme && resolvedTheme !== storedTheme) {
      setThemePreference(resolvedTheme as "light" | "dark");
    }
  }, [resolvedTheme, storedTheme, setThemePreference]);

  return null;
}
