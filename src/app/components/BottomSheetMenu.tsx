import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HelpCircle, LogOut, Settings, ImageIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeMode, useAppStore } from "../store/useAppStore";
import { ToggleSwitch } from "./ToggleSwitch";

interface BottomSheetMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "admin" | "viewer";
  onRoleChange: (role: "admin" | "viewer") => void;
  avatarUrl?: string;
  userName?: string;
  userEmail?: string;
  fallbackInitials?: string;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onLogout?: () => void;
}

export function BottomSheetMenu({
  open,
  onOpenChange,
  role,
  onRoleChange,
  avatarUrl,
  userName = "Jordan Diaz",
  userEmail = "Premium Member",
  fallbackInitials = "PF",
  onSettingsClick,
  onHelpClick,
  onLogout,
}: BottomSheetMenuProps) {
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
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close mobile menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 cursor-default bg-slate-950/40 backdrop-blur-sm"
          />

          <motion.section
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-lg rounded-t-[28px] border border-white/70 bg-white/92 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 shadow-[0px_-20px_50px_rgba(15,28,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0f0f16]/94 dark:shadow-[0px_-20px_50px_rgba(0,0,0,0.55)]"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-200 dark:bg-white/10" />

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

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Role</p>
                  <ToggleSwitch
                    checked={role === "viewer"}
                    onCheckedChange={(checked) => onRoleChange(checked ? "viewer" : "admin")}
                    leftLabel="Admin"
                    rightLabel="Viewer"
                    ariaLabel="Toggle role"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onSettingsClick?.();
                  }}
                  className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border border-white/60 bg-white/70 px-3 text-xs font-semibold text-gray-700 transition-transform active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onHelpClick?.();
                  }}
                  className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border border-white/60 bg-white/70 px-3 text-xs font-semibold text-gray-700 transition-transform active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                >
                  <HelpCircle className="h-4 w-4" />
                  Help
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onLogout?.();
                  }}
                  className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border border-red-200/70 bg-red-50/80 px-3 text-xs font-semibold text-red-600 transition-transform active:scale-[0.98] dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
