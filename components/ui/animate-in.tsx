"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, fadeIn, slideLeft, slideRight, tweenDecel } from "@/lib/animations";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const variantMap: Record<string, Variants> = {
  "fade-up": fadeUp,
  "fade-in": fadeIn,
  "slide-left": slideLeft,
  "slide-right": slideRight,
};

interface AnimateInProps extends Omit<
  HTMLMotionProps<"div">,
  "variants" | "initial" | "whileInView" | "transition"
> {
  variant?: "fade-up" | "fade-in" | "slide-left" | "slide-right";
  delay?: number;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}

function AnimateIn({
  variant = "fade-up",
  delay = 0,
  once = true,
  className,
  children,
  ...props
}: AnimateInProps) {
  const variants = variantMap[variant];

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      transition={{ ...tweenDecel, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { AnimateIn };
