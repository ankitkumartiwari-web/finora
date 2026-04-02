import { Search, Moon, Sun, Download, Filter, ImageIcon, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ThemeMode, useAppStore } from "../store/useAppStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface TopNavProps {
  title: string;
  activePage: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  role: "admin" | "viewer";
  onRoleChange: (role: "admin" | "viewer") => void;
  onNavigate: (
    page: string,
    options?: {
      transactionType?: "all" | "income" | "expense";
      resetFilters?: boolean;
    },
  ) => void;
  avatarUrl?: string;
  userName?: string;
  userSubtitle?: string;
  fallbackInitials?: string;
  onLogout?: () => void;
  onExport?: (format?: "csv" | "json") => void;
}

export function TopNav({ title, activePage, searchQuery, onSearchChange, role, onRoleChange, onNavigate, avatarUrl, userName, userSubtitle, fallbackInitials = "PF", onLogout, onExport }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const setThemePreference = useAppStore((state) => state.setTheme);
  const [searchFocused, setSearchFocused] = useState(false);
  const brandLogo = theme === "dark" ? "/images/darkmode.webp" : "/images/lightmode.webp";
  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, []);

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setThemePreference(nextTheme);
  };

  const displayName = userName || "Jordan Diaz";
  const subtitle = userSubtitle || "Premium Member";
  const isTransactionsPage = activePage === "transactions";
  const canExport = isTransactionsPage && role === "admin" && onExport;

  const handleSearchInputChange = (value: string) => {
    onSearchChange(value);

    if (value.trim() && !isTransactionsPage) {
      onNavigate("transactions", {
        transactionType: "all",
      });
    }
  };

  const exportButtonClassName =
    "flex items-center justify-center gap-2 rounded-2xl bg-[#0b6b45] text-white text-sm font-semibold shadow-lg shadow-green-500/30 dark:bg-gradient-to-r dark:from-[#c78dff] dark:to-[#8f6bff] dark:shadow-[0_10px_30px_rgba(199,141,255,0.35)]";

  return (
    <header className="px-6 lg:px-10 pt-6">
      <div className="md:hidden rounded-[24px] border border-white/70 bg-white/90 dark:bg-[#0f0f16]/95 dark:border-[#1f1f2c] shadow-[0px_24px_60px_rgba(15,28,42,0.08)] dark:shadow-[0px_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl px-4 py-4">
        <div className="relative flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
              aria-label="Go to dashboard"
            >
              <img src={brandLogo} alt="Finora logo" className="h-9 w-9 object-contain" />
            </button>
            <div className="absolute left-1/2 top-1/2 w-[58vw] max-w-[220px] -translate-x-1/2 -translate-y-1/2 space-y-0.5 text-center pointer-events-none">
              <h1 className="truncate text-lg font-semibold text-[#0b6b45] dark:text-[#c78dff]">{title}</h1>
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0px_12px_30px_rgba(15,28,42,0.08)] dark:border-white/10 dark:bg-white/5">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User avatar" className="h-full w-full object-cover" />
            ) : fallbackInitials ? (
              <span className="text-sm font-semibold text-[#0b6b45] dark:text-[#e6d6ff]">{fallbackInitials}</span>
            ) : (
              <ImageIcon className="w-5 h-5 text-[#0b6b45] dark:text-[#e6d6ff]" />
            )}
          </div>
        </div>

        <motion.div animate={{ scale: searchFocused ? 1.01 : 1 }} className="relative mt-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search transactions, cards, invoices..."
            value={searchQuery}
            onChange={(event) => handleSearchInputChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full rounded-2xl border bg-[#f7f9fb] py-3 pl-12 pr-4 transition-all dark:bg-[#1c1c29] ${
              searchFocused
                ? "border-[#0b6b45] shadow-[0_10px_30px_rgba(11,107,69,0.15)] dark:border-[#c78dff] dark:shadow-[0_15px_35px_rgba(199,141,255,0.25)]"
                : "border-transparent dark:border-[#1f1f2c]"
            }`}
          />
        </motion.div>
        {!isTransactionsPage && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Search works on Transactions. Start typing to jump there.
          </p>
        )}

        {isTransactionsPage && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onNavigate("transactions", {
                  transactionType: "all",
                  resetFilters: true,
                })
              }
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:text-[#0b6b45] dark:border-[#1f1f2c] dark:text-gray-300 dark:hover:text-[#c78dff]"
            >
              <Filter className="w-4 h-4" />
              Reset Filters
            </button>

            {canExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`${exportButtonClassName} flex-1 px-3 py-2.5`}
                  >
                    <Download className="w-4 h-4" />
                    Export
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-2xl border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-[#1f1f2c] dark:bg-[#0f0f16]/95"
                >
                  <DropdownMenuItem
                    onClick={() => onExport?.("csv")}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport?.("json")}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Export JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:block">
      <div className="relative mx-auto w-full max-w-[1320px] overflow-hidden rounded-[32px] border border-white/70 bg-white/90 dark:bg-[#0f0f16]/95 dark:border-[#1f1f2c] shadow-[0px_30px_80px_rgba(15,28,42,0.08)] dark:shadow-[0px_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl p-6 lg:p-8 space-y-6">
        <div className="relative z-30 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 dark:text-gray-500">Overview</p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-[#0b6b45] dark:text-[#c78dff] mt-2">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{todayLabel} · Updated in real-time</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 rounded-2xl bg-gray-100 px-1 py-1 dark:bg-[#1c1c29]">
              {["admin", "viewer"].map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onRoleChange(option as "admin" | "viewer")}
                  className={`px-4 py-2 rounded-2xl text-sm capitalize transition-all ${
                    role === option
                      ? "bg-[#0b6b45] text-white shadow-lg shadow-green-500/30 dark:bg-[#c78dff] dark:shadow-[0_10px_30px_rgba(199,141,255,0.35)]"
                      : "text-gray-500 dark:text-gray-300"
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleThemeToggle}
              className="p-3 rounded-2xl border border-gray-100 text-gray-500 hover:text-[#0b6b45] dark:border-[#1f1f2c] dark:text-gray-300 dark:hover:text-[#c78dff]"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-3 py-2 border border-gray-100 rounded-2xl dark:border-[#1f1f2c]"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0b6b45] to-[#98e06c] dark:from-[#c78dff] dark:to-[#9458ff] text-white font-semibold flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                ) : fallbackInitials ? (
                  <span>{fallbackInitials}</span>
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <motion.div animate={{ scale: searchFocused ? 1.01 : 1 }} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search transactions, cards, invoices..."
                value={searchQuery}
                onChange={(event) => handleSearchInputChange(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all bg-[#f7f9fb] dark:bg-[#1c1c29] ${
                  searchFocused
                    ? "border-[#0b6b45] shadow-[0_10px_30px_rgba(11,107,69,0.15)] dark:border-[#c78dff] dark:shadow-[0_15px_35px_rgba(199,141,255,0.25)]"
                    : "border-transparent dark:border-[#1f1f2c]"
                }`}
              />
            </motion.div>
            {!isTransactionsPage && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Search works on Transactions. Start typing to jump there.
              </p>
            )}
          </div>

          {isTransactionsPage && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onNavigate("transactions", {
                    transactionType: "all",
                    resetFilters: true,
                  })
                }
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:text-[#0b6b45] dark:border-[#1f1f2c] dark:text-gray-300 dark:hover:text-[#c78dff]"
              >
                <Filter className="w-4 h-4" />
                Reset Filters
              </button>
              {canExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`${exportButtonClassName} px-4 py-3`}
                    >
                      <Download className="w-4 h-4" />
                      Export
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-2xl border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-[#1f1f2c] dark:bg-[#0f0f16]/95"
                  >
                    <DropdownMenuItem
                      onClick={() => onExport?.("csv")}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onExport?.("json")}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Export JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
      </div>
    </header>
  );
}
