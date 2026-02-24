import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, BarChart3, Target, Zap } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "7,345",
    suffix: "%",
    label: "Total Profit Generated",
    desc: "Across all tracked portfolios",
  },
  {
    icon: BarChart3,
    value: "53",
    suffix: "",
    label: "Trading Patterns Detected",
    desc: "By our AI mistake finder",
  },
  {
    icon: Target,
    value: "92",
    suffix: "%",
    label: "Accuracy Rate",
    desc: "In pattern recognition",
  },
  {
    icon: Zap,
    value: "4",
    suffix: "ms",
    label: "Analysis Speed",
    desc: "Real-time trade analysis",
  },
];

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Platform Statistics</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 mb-4 font-display">
            Trading Intelligence{" "}
            <span className="gradient-text">Statistics</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real-time analytics from our AI-powered trading journal platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-foreground">{stat.value}</span>
                <span className="text-xl font-bold text-primary">{stat.suffix}</span>
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
