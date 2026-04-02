import { useEffect, useState } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { BottomNav } from "./components/BottomNav";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { Insights } from "./components/Insights";
import { AuthExperience } from "./components/auth/AuthExperience";
import { ThemeSynchronizer } from "./components/ThemeSynchronizer";
import { useAppStore } from "./store/useAppStore";
import DemoOne from "@/app/components/ui/demo";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { buildTransactionExport } from "./lib/finance";
import { supabase } from "./lib/supabase";

const APP_PAGES = ["dashboard", "transactions", "insights", "notifications", "help", "settings"] as const;
type AppPage = (typeof APP_PAGES)[number];
const ACTIVE_PAGE_STORAGE_KEY = "finora-active-page";

function getInitialActivePage(): AppPage {
  if (typeof window === "undefined") {
    return "dashboard";
  }

  const storedPage = window.localStorage.getItem(ACTIVE_PAGE_STORAGE_KEY);
  return APP_PAGES.includes(storedPage as AppPage) ? (storedPage as AppPage) : "dashboard";
}

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>(getInitialActivePage);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [transactionsFilterPreset, setTransactionsFilterPreset] = useState<
    "all" | "income" | "expense"
  >("all");
  const [transactionsResetTrigger, setTransactionsResetTrigger] = useState(0);
  const [createTransactionTrigger, setCreateTransactionTrigger] = useState(0);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  const authStatus = useAppStore((state) => state.authStatus);
  const user = useAppStore((state) => state.user);
  const role = useAppStore((state) => state.role);
  const transactions = useAppStore((state) => state.transactions);
  const setRole = useAppStore((state) => state.setRole);
  const theme = useAppStore((state) => state.theme);
  const logout = useAppStore((state) => state.logout);
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const syncAuthUser = useAppStore((state) => state.syncAuthUser);

  const pageTitle = {
    dashboard: "Dashboard",
    transactions: "Transactions",
    insights: "Insights",
    notifications: "Notifications",
    help: "Help",
    settings: "Settings",
  }[activePage] || "Dashboard";

  const isAuthenticated = authStatus === "authenticated";

  useEffect(() => {
    if (!isAuthenticated) {
      document.title = "Finora — Authentication";
      return;
    }

    document.title = `Finora — ${pageTitle}`;
  }, [isAuthenticated, pageTitle]);

  useEffect(() => {
    let isMounted = true;

    initializeAuth().finally(() => {
      if (isMounted) {
        setAuthBootstrapped(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initializeAuth]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuthUser(session?.user ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [syncAuthUser]);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, activePage);
  }, [activePage]);

  const handleCreateTransaction = () => {
    setTransactionsFilterPreset("all");
    setActivePage("transactions");
    setCreateTransactionTrigger((prev) => prev + 1);
  };

  const handleNavigate = (
    page: AppPage,
    options?: {
      transactionType?: "all" | "income" | "expense";
      resetFilters?: boolean;
    },
  ) => {
    if (page === "transactions") {
      setTransactionsFilterPreset(options?.transactionType ?? "all");
      if (options?.resetFilters) {
        setTransactionsResetTrigger((current) => current + 1);
      }
    }
    setActivePage(page);
  };

  const handleExport = (format: "csv" | "json" = "csv") => {
    const result = buildTransactionExport(transactions, format);
    const { content, filename, mimeType } = result as any;

    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  if (!authBootstrapped) {
    return (
      <ThemeProvider>
        <ThemeSynchronizer />
        <div className="flex min-h-screen items-center justify-center bg-[#e2e7ee] dark:bg-[#050509]">
          <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white/70 bg-white/85 px-6 py-8 shadow-[0_24px_60px_rgba(15,28,42,0.12)] backdrop-blur-xl dark:border-[#1f1f2c] dark:bg-[#0f0f16]/92">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0b6b45]/20 border-t-[#0b6b45] dark:border-[#c78dff]/20 dark:border-t-[#c78dff]" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading secure session...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ThemeSynchronizer />
      <div className="relative min-h-screen overflow-hidden bg-[#e2e7ee] dark:bg-[#050509]">
        <div className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-100">
          <DemoOne />
        </div>

        {isAuthenticated ? (
          <div className="relative z-10">
            <Sidebar activePage={activePage} onNavigate={handleNavigate} />

            <div className="md:ml-16 xl:ml-[280px] flex flex-col gap-6">
              <TopNav
                title={pageTitle}
                activePage={activePage}
                searchQuery={globalSearchQuery}
                onSearchChange={setGlobalSearchQuery}
                role={role}
                onRoleChange={setRole}
                onNavigate={handleNavigate}
                avatarUrl={user?.profileImage}
                userName={user?.name}
                userSubtitle={user?.email}
                fallbackInitials={user?.initials}
                onLogout={logout}
                onExport={handleExport}
              />

              <main className="px-4 sm:px-6 lg:px-10 pb-[calc(92px+env(safe-area-inset-bottom))] md:pb-12">
                {activePage === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
                {activePage === "transactions" && (
                  <Transactions
                    role={role}
                    createTrigger={createTransactionTrigger}
                    presetFilterType={transactionsFilterPreset}
                    resetFiltersTrigger={transactionsResetTrigger}
                    globalSearchQuery={globalSearchQuery}
                  />
                )}
                {activePage === "insights" && <Insights />}
                {activePage === "notifications" && (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500 dark:text-gray-400">Notifications page coming soon...</p>
                  </div>
                )}
                {activePage === "help" && (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500 dark:text-gray-400">Help page coming soon...</p>
                  </div>
                )}
                {activePage === "settings" && (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500 dark:text-gray-400">Settings page coming soon...</p>
                  </div>
                )}
              </main>

              {role === "admin" && (
                <motion.button
                  type="button"
                  onClick={handleCreateTransaction}
                  aria-label="Create transaction"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    opacity: { duration: 0.25 },
                    y: { duration: 0.25 },
                    scale: { duration: 1.8, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" },
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="fixed bottom-[calc(92px+env(safe-area-inset-bottom)+12px)] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0b6b45] text-white shadow-[0_18px_36px_rgba(11,107,69,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95 dark:bg-[#c78dff] dark:text-[#11111a] dark:shadow-[0_18px_36px_rgba(199,141,255,0.4)] md:bottom-8 md:right-8"
                >
                  <Plus className="h-6 w-6" />
                </motion.button>
              )}
            </div>
          </div>
        ) : (
          <AuthExperience />
        )}

        {isAuthenticated && (
          <BottomNav
            activePage={activePage}
            onNavigate={handleNavigate}
            role={role}
            onRoleChange={setRole}
            avatarUrl={user?.profileImage}
            userName={user?.name}
            userEmail={user?.email}
            fallbackInitials={user?.initials}
            onLogout={logout}
            onSettingsClick={() => setActivePage("settings")}
            onHelpClick={() => setActivePage("help")}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
