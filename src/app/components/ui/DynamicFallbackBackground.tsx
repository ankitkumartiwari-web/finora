import { motion } from "motion/react";

interface DynamicFallbackBackgroundProps {
  className?: string;
}

export function DynamicFallbackBackground({
  className = "",
}: DynamicFallbackBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-[#0b6b45]/25 blur-3xl dark:bg-[#b56fff]/20"
        animate={{ x: [0, -30, 12, 0], y: [0, 24, -14, 0], scale: [1, 1.1, 0.94, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-28 -left-14 h-[24rem] w-[24rem] rounded-full bg-[#9efac8]/35 blur-[120px] dark:bg-[#5a2bb8]/30"
        animate={{ x: [0, 20, -12, 0], y: [0, -18, 10, 0], scale: [1, 0.95, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -left-10 h-64 w-64 rounded-full bg-[#6ac6ff]/20 blur-[100px] dark:bg-[#8f6bff]/20"
        animate={{ x: [0, 16, -8, 0], y: [0, -24, 10, 0], opacity: [0.4, 0.7, 0.45, 0.4] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPosition: ["0% 0%", "100% 40%", "35% 100%", "0% 0%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.22), transparent 42%), radial-gradient(circle at 78% 10%, rgba(15,107,69,0.24), transparent 44%), radial-gradient(circle at 60% 84%, rgba(106,198,255,0.2), transparent 40%), radial-gradient(circle at 30% 70%, rgba(199,141,255,0.22), transparent 42%)",
          backgroundSize: "180% 180%",
          opacity: 0.7,
        }}
      />
    </div>
  );
}
