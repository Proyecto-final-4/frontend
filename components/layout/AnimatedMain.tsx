"use client";

import { motion } from "framer-motion";
import { tweenDecel } from "@/lib/animations";

interface AnimatedMainProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedMain({ children, className }: AnimatedMainProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={tweenDecel}
      className={className}
    >
      {children}
    </motion.div>
  );
}
