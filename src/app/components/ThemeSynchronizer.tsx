import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "../store/useAppStore";

export function ThemeSynchronizer() {
  const { setTheme, resolvedTheme } = useTheme();
  const storedTheme = useAppStore((state) => state.theme);

  useEffect(() => {
    if (storedTheme && resolvedTheme !== storedTheme) {
      console.info("[Finora theme debug] ThemeSynchronizer apply store theme", {
        storedTheme,
        resolvedTheme,
      });
      setTheme(storedTheme);
    }
  }, [storedTheme, setTheme]);

  return null;
}
