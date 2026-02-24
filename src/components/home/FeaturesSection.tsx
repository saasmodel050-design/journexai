import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, Heart, BookOpen, BarChart3, LayoutDashboard, Bot } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "AI Mistake Finder",
    desc: "Automatically detects recurring mistakes across your trade history.",
    stat: "23 patterns",
    statLabel: "detected avg.",
    color: "primary",
  },
  {
    icon: Heart,
    title: "Emotion Tracking",
    desc: "Tags trades with emotional states like FOMO, revenge, and overconfidence.",
    stat: "5 emotions",
    statLabel: "tracked",
    color: "neon-purple",
  },
  {
    icon: BookOpen,
    title: "Trade Journal",
    desc: "Smart journaling with auto-filled data and screenshot attachments.",
    stat: "< 30 sec",
    statLabel: "per entry",
    color: "neon-blue",
  },
  {
    icon: BarChart3,
    title: "Strategy Analytics",
    desc: "Break down performance by strategy, pair, session, and timeframe.",
    stat: "12 metrics",
    statLabel: "per strategy",
    color: "chart-green",
  },
  {
    icon: LayoutDashboard,
    title: "Performance Dashboard",
    desc: "Real-time overview of your trading stats with beautiful charts.",
    stat: "Real-time",
    statLabel: "updates",
    color: "neon-cyan",
  },
  {
    icon: Bot,
    title: "AI Trading Coach",
    desc: "Personalized advice and warnings based on your trading behavior.",
    stat: "24/7",
    statLabel: "coaching",
    color: "accent",
  },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  "neon-purple": "bg-neon-purple/10 text-neon-purple",
  "neon-blue": "bg-neon-blue/10 text-neon-blue",
  "chart-green": "bg-chart-green/10 text-chart-green",
  "neon-cyan": "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Core Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            Everything You Need to <span className="gradient-text">Trade Better</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card-hover p-6 flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{f.desc}</p>
              <div className="pt-4 border-t border-border">
                <span className="font-mono text-lg font-bold text-foreground">{f.stat}</span>
                <span className="text-xs text-muted-foreground ml-2">{f.statLabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
