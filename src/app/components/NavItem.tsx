import { type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "./ui/utils";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  showDot?: boolean;
  onClick: () => void;
}

export function NavItem({ icon: Icon, label, active = false, showDot = false, onClick }: NavItemProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className="flex h-full min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-center"
    >
      <span
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all",
          active
            ? "bg-gradient-to-br from-[#0b6b45] to-[#98e06c] text-white shadow-[0px_10px_24px_rgba(11,107,69,0.24)] dark:from-[#c78dff] dark:to-[#8f6bff] dark:shadow-[0px_10px_24px_rgba(199,141,255,0.24)]"
            : "text-gray-500 opacity-70 dark:text-gray-300 dark:opacity-60",
        )}
      >
        <Icon className="h-5 w-5" />
        {showDot && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500 shadow-[0px_0px_0px_2px_rgba(255,255,255,0.9)] dark:shadow-[0px_0px_0px_2px_rgba(15,15,22,0.95)]" />}
      </span>
      <span
        className={cn(
          "text-[10px] font-semibold leading-none tracking-wide transition-colors",
          active ? "text-[#0b6b45] dark:text-[#e2c9ff]" : "text-gray-500 dark:text-gray-400",
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}
