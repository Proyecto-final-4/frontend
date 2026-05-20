import type { Transition, Variants } from "framer-motion";

/** Spring for primary enter animations (Framer Stackwise). */
export const springEnter: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 1,
};

/** Softer spring for secondary elements or containers. */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 1,
};

/** Deceleration tween: cubic-bezier(0.27, 0, 0.51, 1). */
export const tweenDecel: Transition = {
  type: "tween",
  ease: [0.27, 0, 0.51, 1],
  duration: 0.5,
};

/** Fast tween for micro-interactions (hover, focus). */
export const tweenFast: Transition = {
  type: "tween",
  ease: [0.27, 0, 0.51, 1],
  duration: 0.22,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: tweenDecel,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: tweenDecel,
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: tweenDecel,
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: tweenDecel,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: tweenDecel,
  },
};

export function shouldAnimate(): boolean {
  if (typeof window === "undefined") return true;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
