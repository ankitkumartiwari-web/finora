import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Bell,
  LogOut,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "../store/useAppStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

interface SidebarItem {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  showDot?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { resolvedTheme } = useTheme();
  const logout = useAppStore((state) => state.logout);
  const brandLogo = resolvedTheme === "dark" ? "/images/darkmode.webp" : "/images/lightmode.webp";

  const menuItems = useMemo<SidebarItem[]>(
    () => [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: 0 },
      { id: "insights", icon: BarChart3, label: "Insights", badge: 2 },
      { id: "transactions", icon: CreditCard, label: "Transactions", badge: 0 },
      { id: "notifications", icon: Bell, label: "Notifications", badge: 0, showDot: true },
    ],
    []
  );

  const tabletMenuItems = useMemo<SidebarItem[]>(
    () => [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { id: "insights", icon: BarChart3, label: "Insights" },
      { id: "transactions", icon: CreditCard, label: "Transactions" },
      { id: "notifications", icon: Bell, label: "Notifications", showDot: true },
    ],
    []
  );

  const tabletToolItems = useMemo<SidebarItem[]>(
    () => [
      { id: "logout", icon: LogOut, label: "Logout", destructive: true, onClick: logout },
      { id: "settings", icon: Settings, label: "Settings" },
      { id: "help", icon: HelpCircle, label: "Help" },
    ],
    [logout]
  );

  const tools = useMemo<SidebarItem[]>(
    () => [
      { id: "settings", icon: Settings, label: "Settings" },
      { id: "help", icon: HelpCircle, label: "Help Center" },
    ],
    []
  );

  const renderIconOnlyItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const isActive = !item.onClick && activePage === item.id;

    return (
      <Tooltip key={item.id}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => {
              if (item.disabled) return;
              if (item.onClick) {
                item.onClick();
                return;
              }
              onNavigate(item.id);
            }}
            disabled={item.disabled}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 ${
              item.destructive
                ? "text-red-500 hover:bg-red-50 hover:text-red-600 hover:shadow-[0_10px_24px_rgba(239,68,68,0.15)] dark:text-red-300 dark:hover:bg-red-500/10 dark:hover:text-red-200"
                : isActive
                ? "bg-[#0b6b45] text-white shadow-[0_12px_30px_rgba(11,107,69,0.28)] ring-1 ring-[#0b6b45]/25 dark:bg-[#c78dff] dark:text-[#0d0d14] dark:shadow-[0_12px_30px_rgba(199,141,255,0.35)] dark:ring-[#c78dff]/30"
                : "text-gray-500 hover:bg-gray-100 hover:text-[#0b6b45] hover:shadow-[0_10px_24px_rgba(15,28,42,0.08)] dark:text-gray-400 dark:hover:bg-[#1c1c29] dark:hover:text-[#e6d6ff]"
            } ${item.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <span
              className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                item.destructive
                  ? "bg-red-500/8 dark:bg-red-500/15"
                  : isActive
                  ? "bg-white/10"
                  : "bg-[#0b6b45]/5 dark:bg-[#c78dff]/10"
              }`}
            />
            <Icon className="relative z-10 h-4 w-4" />
            {item.showDot && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff4d4f] ring-2 ring-white dark:ring-[#0f0f16]" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-white/10 bg-[#10131c] px-3 py-2 text-xs text-white shadow-xl dark:bg-white dark:text-[#0d0d14]">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  const SidebarContent = () => (
    <div className="relative overflow-hidden flex flex-col h-full p-6 text-gray-900 dark:text-gray-100">
      <div className="relative z-10 flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-8"
        >
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
            aria-label="Go to dashboard"
          >
            <img
              src={brandLogo}
              alt="Logo"
              className="w-full h-full object-contain"
              style={{ background: 'transparent' }}
            />
          </button>
        </motion.div>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Menu</p>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 6 }}
              onClick={() => {
                if (item.disabled) return;
                onNavigate(item.id);
              }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#e8fff2] text-[#0b6b45] shadow-sm dark:bg-[#1f1f2c] dark:text-white dark:shadow-[0_10px_30px_rgba(199,141,255,0.25)]"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#1c1c29]"
              } ${item.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span
                className={`relative p-2 rounded-xl ${
                  isActive
                    ? "bg-white text-[#0b6b45] dark:bg-[#2a2a3c] dark:text-white"
                    : "bg-white text-gray-400 dark:bg-[#15151d] dark:text-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.showDot && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff4d4f] ring-2 ring-white dark:ring-[#15151d]" />
                )}
              </span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-white text-gray-500 border border-gray-200 dark:bg-[#15151d] dark:text-gray-300 dark:border-[#1f1f2c]">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="ml-2 w-1.5 h-1.5 rounded-full bg-[#0b6b45] dark:bg-[#c78dff]"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-8 space-y-2">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Tools</p>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-600 dark:text-red-300" />
          Logout
        </button>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onNavigate(tool.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#1c1c29] transition-colors"
            >
              <Icon className="w-4 h-4" />
              {tool.label}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );

  const TabletSidebarContent = () => (
    <TooltipProvider delayDuration={0}>
      <div className="relative flex h-full flex-col items-center py-5 text-gray-900 dark:text-gray-100">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="mb-6 flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl transition-transform duration-200 hover:scale-105"
          aria-label="Go to dashboard"
        >
          <img src={brandLogo} alt="Logo" className="h-full w-full object-contain" style={{ background: "transparent" }} />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          {tabletMenuItems.map((item) => renderIconOnlyItem(item))}
        </div>

        <div className="mb-2 flex flex-col items-center gap-3">
          {tabletToolItems.map((item) => renderIconOnlyItem(item))}
        </div>
      </div>
    </TooltipProvider>
  );

  const SidebarRailContent = () => (
    <div className="relative flex h-full flex-col items-center px-3 py-6 text-gray-900 dark:text-gray-100">
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className="mb-8 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl"
        aria-label="Go to dashboard"
      >
        <img src={brandLogo} alt="Logo" className="h-full w-full object-contain" style={{ background: "transparent" }} />
      </button>

      <div className="flex flex-1 flex-col items-center gap-3">
        {menuItems.map((item) => renderIconOnlyItem(item))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {tools.map((tool) => renderIconOnlyItem(tool))}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex xl:hidden fixed left-0 top-0 h-screen w-16 min-w-16 max-w-16">
        <div className="w-full h-full border-r border-gray-100/80 bg-white/80 shadow-[4px_0_24px_rgba(15,28,42,0.05)] backdrop-blur-xl rounded-r-[24px] dark:bg-[#0f0f16]/88 dark:border-[#1f1f2c] dark:shadow-[4px_0_28px_rgba(0,0,0,0.6)]">
          <TabletSidebarContent />
        </div>
      </aside>

      <aside className="hidden xl:flex fixed left-0 top-0 h-screen w-[280px] min-w-[260px] max-w-[280px]">
        <div className="w-full h-full bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(15,28,42,0.04)] rounded-r-[32px] dark:bg-[#0f0f16] dark:border-[#1f1f2c] dark:shadow-[4px_0_28px_rgba(0,0,0,0.6)]">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
