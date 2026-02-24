import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Search, Heart, BarChart3, Target, Sparkles } from "lucide-react";

const solutions = [
  { icon: Brain, title: "AI Trade Journal", desc: "Automatically log and categorize every trade with smart tagging" },
  { icon: Search, title: "Mistake Detection", desc: "AI identifies patterns in your losing trades you can't see" },
  { icon: Heart, title: "Emotion Tracking", desc: "Detect FOMO, revenge trading, and emotional decisions" },
  { icon: BarChart3, title: "Performance Analytics", desc: "Deep insights into your trading metrics and habits" },
  { icon: Target, title: "Strategy Optimization", desc: "Data-driven suggestions to improve your edge" },
  { icon: Sparkles, title: "AI Trading Coach", desc: "Personalized coaching based on your trading behavior" },
];

const SolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[120px]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">The Solution</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            AI That Turns Your <span className="gradient-text">Trading Data</span> Into Edge
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            TradeMind AI analyzes every trade to find hidden patterns, emotional triggers, and opportunities for improvement.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {solutions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card-hover p-6 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
