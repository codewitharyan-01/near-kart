import type { Variants, Transition } from "framer-motion";

export const spring: Transition = { type: "spring", stiffness: 260, damping: 26 };
export const springSoft: Transition = { type: "spring", stiffness: 120, damping: 20 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 } }),
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: spring },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/** Reveal-on-scroll wrapper props for motion.div */
export const revealProps = {
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, margin: "-60px" },
} as const;
