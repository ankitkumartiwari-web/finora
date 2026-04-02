import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImageIcon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeMode, useAppStore } from "../store/useAppStore";
import { ToggleSwitch } from "./ToggleSwitch";

interface AvatarMenuProps {
  avatarUrl?: string;
  fallbackInitials?: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function AvatarMenu({
  avatarUrl,
  fallbackInitials = "PF",
  userName = "Jordan Diaz",
  userEmail = "Premium Member",
  onLogout,
}: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const storedTheme = useAppStore((state) => state.theme);
  const setThemePreference = useAppStore((state) => state.setTheme);

  const isDarkTheme = (storedTheme ?? theme) === "dark";

  const handleThemeToggle = (nextDark: boolean) => {
    const nextTheme: ThemeMode = nextDark ? "dark" : "light";
    setThemePreference(nextTheme);
    setTheme(nextTheme);
  };

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("Finora theme state:", storedTheme ?? theme);
    }
  }, [storedTheme, theme]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((current) => !current)}
        className="relative z-50 flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white/80 text-white shadow-[0px_16px_30px_rgba(15,28,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
        aria-label="Open profile menu"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="User avatar" className="h-full w-full object-cover" />
        ) : fallbackInitials ? (
          <span className="text-sm font-semibold text-[#0b6b45] dark:text-[#e6d6ff]">{fallbackInitials}</span>
        ) : (
          <ImageIcon className="h-5 w-5 text-[#0b6b45] dark:text-[#e6d6ff]" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close profile menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.section
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-4 left-4 right-4 z-50 mx-auto w-[min(100%-2rem,28rem)] overflow-hidden rounded-[28px] border border-white/65 bg-white/90 p-4 shadow-[0px_30px_90px_rgba(15,28,42,0.22)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0f0f16]/92 dark:shadow-[0px_30px_90px_rgba(0,0,0,0.55)]"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-[24px] border border-white/60 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b6b45] to-[#98e06c] text-white dark:from-[#c78dff] dark:to-[#8f6bff]">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="User avatar" className="h-full w-full object-cover" />
                    ) : fallbackInitials ? (
                      <span className="text-sm font-semibold">{fallbackInitials}</span>
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Theme</p>
                    <ToggleSwitch
                      checked={isDarkTheme}
                      onCheckedChange={handleThemeToggle}
                      leftLabel="Light"
                      rightLabel="Dark"
                      ariaLabel="Toggle theme"
                    />
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/70 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-600 transition-transform active:scale-[0.98] dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}

              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
