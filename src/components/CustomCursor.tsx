import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import cursorUrl from "@/assets/cursor-bull.png";
import { useCursorPreference } from "@/hooks/useCursorPreference";

/**
 * Cursor artwork geometry.
 * Source image is 320x235; the arrow tip sits at roughly (240, 18) in source pixels.
 * The artwork is mirrored horizontally, so the tip lands at (WIDTH - 240 * SCALE, 18 * SCALE).
 */
const WIDTH = 84;
const SCALE = WIDTH / 320;
const TIP_X = WIDTH - 240 * SCALE; // ≈ 21
const TIP_Y = 18 * SCALE; // ≈ 5

const CustomCursor = () => {
  const { enabled: preferred } = useCursorPreference();
  const [supported, setSupported] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });

  // Desktop pointer only + honour reduced-motion
  useEffect(() => {
    const query = window.matchMedia(
      "(pointer: fine) and (hover: hover) and (min-width: 1024px)"
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSupported(query.matches && !motionQuery.matches);
    update();
    query.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  const active = supported && preferred;

  useEffect(() => {
    if (!active) return;
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
  }, [active, x, y]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ x: springX, y: springY, width: 0, height: 0 }}
    >
      {/* Artwork box is offset so the arrow tip sits exactly on the pointer,
          and scaling is anchored to that same tip. */}
      <motion.div
        className="absolute"
        style={{
          left: -TIP_X,
          top: -TIP_Y,
          width: WIDTH,
          transformOrigin: `${TIP_X}px ${TIP_Y}px`,
        }}
        animate={{
          scale: pressed ? 0.75 : hovering ? 1.2 : 1,
          rotate: pressed ? -12 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <img
          src={cursorUrl}
          alt=""
          draggable={false}
          width={320}
          height={235}
          className="select-none block drop-shadow-[0_0_12px_hsl(var(--neon-green)/0.8)]"
          style={{ width: WIDTH, height: "auto", maxWidth: "none", transform: "scaleX(-1)" }}
        />
      </motion.div>
      <motion.span
        className="absolute -left-5 -top-5 w-10 h-10 rounded-full border border-neon-green/60"
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
