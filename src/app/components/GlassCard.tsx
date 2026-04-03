import { motion } from "motion/react";
import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative overflow-hidden
        backdrop-blur-xl bg-white/90 dark:bg-[#12121b]/90
        border border-gray-200/60 dark:border-[#1f1f2c]
        rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.55)]
        ${hover ? "hover:shadow-2xl hover:shadow-[#0b6b45]/20 dark:hover:shadow-[0_25px_55px_rgba(199,141,255,0.4)]" : ""}
        transition-shadow duration-300
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
