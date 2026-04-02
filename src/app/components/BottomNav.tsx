import { useState } from "react";
import { BarChart3, Bell, Home, MoreHorizontal, Wallet } from "lucide-react";
import { BottomSheetMenu } from "./BottomSheetMenu";
import { NavItem } from "./NavItem";

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
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

export function BottomNav({
  activePage,
  onNavigate,
  role,
  onRoleChange,
  avatarUrl,
  userName,
  userEmail,
  fallbackInitials,
  onSettingsClick,
  onHelpClick,
  onLogout,
}: BottomNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="border-t border-white/60 bg-white/90 px-2 pt-2 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f0f16]/94">
          <div className="grid h-[68px] grid-cols-5 pb-[calc(env(safe-area-inset-bottom)+6px)]">
            <NavItem icon={Home} label="Dashboard" active={activePage === "dashboard"} onClick={() => onNavigate("dashboard")} />
            <NavItem icon={Wallet} label="Transactions" active={activePage === "transactions"} onClick={() => onNavigate("transactions")} />
            <NavItem icon={BarChart3} label="Insights" active={activePage === "insights"} onClick={() => onNavigate("insights")} />
            <NavItem
              icon={Bell}
              label="Notifications"
              active={activePage === "notifications"}
              showDot
              onClick={() => onNavigate("notifications")}
            />
            <NavItem icon={MoreHorizontal} label="Menu" active={menuOpen} onClick={() => setMenuOpen(true)} />
          </div>
        </div>
      </nav>

      <BottomSheetMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        role={role}
        onRoleChange={onRoleChange}
        avatarUrl={avatarUrl}
        userName={userName}
        userEmail={userEmail}
        fallbackInitials={fallbackInitials}
        onSettingsClick={onSettingsClick}
        onHelpClick={onHelpClick}
        onLogout={onLogout}
      />
    </>
  );
}
