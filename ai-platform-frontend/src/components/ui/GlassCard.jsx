import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function GlassCard({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
      className={twMerge(
        clsx(
          "relative overflow-hidden",
          "bg-white/40 dark:bg-gray-900/40", // High transparency
          "backdrop-blur-xl", // The heavy blur
          "border border-white/20 dark:border-gray-700/30", // Subtle border
          "shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]", // Soft colored shadow
          "rounded-2xl",
          className
        )
      )}
    >
      {/* Optional: Add a subtle shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}