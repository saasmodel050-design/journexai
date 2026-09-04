import { useMemo } from "react";
import { motion } from "framer-motion";

type Candle = { o: number; c: number; h: number; l: number };

// Deterministic pseudo-random generator so the chart is stable between renders
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const W = 560;
const H = 320;
const PAD = 24;

const generateCandles = (count: number): Candle[] => {
  const rand = mulberry32(42);
  const candles: Candle[] = [];
  let price = 100;
  for (let i = 0; i < count; i++) {
    const drift = Math.sin(i / 4.5) * 2.2 + (i > count * 0.55 ? 0.9 : 0.15);
    const change = (rand() - 0.45) * 5 + drift;
    const o = price;
    const c = price + change;
    const h = Math.max(o, c) + rand() * 2.4;
    const l = Math.min(o, c) - rand() * 2.4;
    candles.push({ o, c, h, l });
    price = c;
  }
  return candles;
};

const HeroCandleChart = () => {
  const { candles, min, max } = useMemo(() => {
    const candles = generateCandles(34);
    const min = Math.min(...candles.map((c) => c.l));
    const max = Math.max(...candles.map((c) => c.h));
    return { candles, min, max };
  }, []);

  const y = (v: number) => PAD + ((max - v) / (max - min)) * (H - PAD * 2);
  const step = (W - PAD * 2) / candles.length;
  const bodyW = Math.max(4, step * 0.62);

  // Area line through closes
  const linePoints = candles
    .map((c, i) => `${PAD + i * step + step / 2},${y(c.c)}`)
    .join(" ");
  const areaPoints = `${PAD},${H - PAD} ${linePoints} ${W - PAD},${H - PAD}`;

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const pctChange = (((last.c - prev.c) / prev.c) * 100).toFixed(2);
  const up = last.c >= prev.c;

  return (
    <div className="glass-card rounded-2xl overflow-hidden neon-glow">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/40">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-chart-red/70" />
          <span className="w-3 h-3 rounded-full bg-[hsl(45_93%_55%)]/70" />
          <span className="w-3 h-3 rounded-full bg-chart-green/70" />
        </div>
        <div className="flex items-center gap-3 font-mono text-xs ml-auto mr-2">
          <span className="text-foreground font-semibold">BTC/USD</span>
          <span className={up ? "text-chart-green" : "text-chart-red"}>
            {up ? "+" : ""}
            {pctChange}%
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-chart-green animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-background/60">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          role="img"
          aria-label="Animated candlestick chart showing BTC/USD price action trending upward"
        >
          <defs>
            <linearGradient id="heroAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((f) => (
            <line
              key={f}
              x1={PAD}
              x2={W - PAD}
              y1={PAD + (H - PAD * 2) * f}
              y2={PAD + (H - PAD * 2) * f}
              stroke="hsl(var(--border))"
              strokeOpacity="0.5"
              strokeDasharray="3 6"
            />
          ))}

          {/* Area under price line */}
          <motion.polygon
            points={areaPoints}
            fill="url(#heroAreaFill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
          />
          <motion.polyline
            points={linePoints}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.4, ease: "easeInOut" }}
          />

          {/* Candles */}
          {candles.map((c, i) => {
            const x = PAD + i * step + step / 2;
            const bullish = c.c >= c.o;
            const color = bullish
              ? "hsl(var(--chart-green))"
              : "hsl(var(--chart-red))";
            const bodyTop = y(Math.max(c.o, c.c));
            const bodyH = Math.max(2, Math.abs(y(c.o) - y(c.c)));
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.035 }}
                style={{ transformOrigin: `${x}px ${y((c.h + c.l) / 2)}px` }}
              >
                <line
                  x1={x}
                  x2={x}
                  y1={y(c.h)}
                  y2={y(c.l)}
                  stroke={color}
                  strokeWidth="1.4"
                />
                <rect
                  x={x - bodyW / 2}
                  y={bodyTop}
                  width={bodyW}
                  height={bodyH}
                  rx="1.5"
                  fill={color}
                />
              </motion.g>
            );
          })}

          {/* Last price marker */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <line
              x1={PAD}
              x2={W - PAD}
              y1={y(last.c)}
              y2={y(last.c)}
              stroke={up ? "hsl(var(--chart-green))" : "hsl(var(--chart-red))"}
              strokeDasharray="4 4"
              strokeOpacity="0.8"
            />
          </motion.g>
        </svg>

        {/* Price tag */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.7 }}
          className="absolute right-3 px-2 py-1 rounded-md font-mono text-xs font-semibold bg-chart-green/15 text-chart-green border border-chart-green/30"
          style={{ top: `${(y(last.c) / H) * 100}%`, transform: "translateY(-50%)" }}
        >
          {(last.c * 612.4).toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </motion.div>
      </div>

      {/* Terminal footer stats */}
      <div className="grid grid-cols-3 divide-x divide-border/60 border-t border-border/60 bg-secondary/30">
        {[
          { label: "Session P&L", value: "+$1,248", tone: "text-chart-green" },
          { label: "Win Rate", value: "68.5%", tone: "text-primary" },
          { label: "AI Alerts", value: "2 active", tone: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="px-4 py-3 text-center">
            <div className={`font-mono text-sm font-bold ${s.tone}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCandleChart;
