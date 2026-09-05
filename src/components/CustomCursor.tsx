import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import cursorAsset from "@/assets/cursor-bull.png.asset.json";

const cursorUrl = (cursorAsset as { url: string }).url;

const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });

  useEffect(() => {
    // Only enable on devices with a precise pointer (mouse), not touch
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement | null;
      setHovering(
        !!target?.closest("a, button, [role='button'], input, select, textarea, label")
      );
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ x: springX, y: springY }}
    >
      <motion.img
        src={cursorUrl}
        alt=""
        draggable={false}
        className="mix-blend-screen select-none"
        style={{ width: 64, height: 64, objectFit: "contain" }}
        animate={{
          scale: pressed ? 0.75 : hovering ? 1.2 : 1,
          rotate: pressed ? -12 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        // anchor the arrow tip at the click point
        initial={false}
      />
      <motion.span
        className="absolute -left-2 -top-2 w-10 h-10 rounded-full border border-neon-green/60"
        animate={{
          scale: pressed ? 0.6 : hovering ? 1.4 : 1,
          opacity: hovering ? 1 : 0.5,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </motion.div>
  );
};

export default CustomCursor;
