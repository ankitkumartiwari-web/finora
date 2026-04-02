import { motion } from "motion/react";
import { cn } from "./ui/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  leftLabel: string;
  rightLabel: string;
  ariaLabel: string;
}

export function ToggleSwitch({ checked, onCheckedChange, leftLabel, rightLabel, ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      aria-pressed={checked}
      aria-label={ariaLabel}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-left transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      <span className={cn("text-sm font-semibold transition-colors", !checked ? "text-[#0b6b45] dark:text-[#c78dff]" : "text-gray-400 dark:text-gray-500")}>
        {leftLabel}
      </span>

      <span className="relative h-8 w-16 shrink-0 rounded-full border border-gray-200 bg-gray-100 p-1 shadow-inner dark:border-white/10 dark:bg-[#161621]">
        <motion.span
          animate={{ x: checked ? 30 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="block h-6 w-6 rounded-full bg-white shadow-[0px_10px_24px_rgba(15,28,42,0.18)] dark:bg-[#d8d8e4]"
        />
      </span>

      <span className={cn("text-sm font-semibold transition-colors", checked ? "text-[#0b6b45] dark:text-[#c78dff]" : "text-gray-400 dark:text-gray-500")}>
        {rightLabel}
      </span>
    </button>
  );
}
