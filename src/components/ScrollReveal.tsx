import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "left" | "right" | "up";
};

/** Reveals content on entry and adds restrained depth while it crosses the viewport. */
const ScrollReveal = ({ children, delay = 0, className, direction = "up" }: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const depthY = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [0, 0, 0] : [18, 0, -18]);
  const initialX = direction === "left" ? -32 : direction === "right" ? 32 : 0;
  const initialY = direction === "up" ? 42 : 20;

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, x: initialX, y: initialY, scale: 0.985, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px 0px -70px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <motion.div style={{ y: depthY }}>{children}</motion.div>
    </motion.div>
  );
};

export default ScrollReveal;
