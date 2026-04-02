import { useEffect } from "react";
import { useTheme } from "next-themes";
import { ThemeMode, useAppStore } from "../store/useAppStore";

export function ThemeSynchronizer() {
  const { setTheme, resolvedTheme } = useTheme();
  const storedTheme = useAppStore((state) => state.theme);
  const setStoredTheme = useAppStore((state) => state.setTheme);

  useEffect(() => {
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storedTheme, setTheme]);

  useEffect(() => {
    if (resolvedTheme && resolvedTheme !== storedTheme) {
      setStoredTheme(resolvedTheme as ThemeMode);
    }
  }, [resolvedTheme, storedTheme, setStoredTheme]);

  return null;
}
