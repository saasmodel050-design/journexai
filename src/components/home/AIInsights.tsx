import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Bot, AlertTriangle, TrendingDown } from "lucide-react";

const insights = [
  {
    icon: AlertTriangle,
    type: "Pattern Alert",
    message: "You tend to lose after 2 consecutive losses. Consider taking a break after back-to-back losses.",
    severity: "warning",
  },
  {
    icon: TrendingDown,
    type: "Session Analysis",
    message: "You perform best during the London session (62% win rate) vs. Asian session (38% win rate).",
    severity: "info",
  },
  {
    icon: Bot,
    type: "Emotion Detection",
    message: "You lose 65% of trades when trading with FOMO. Identified 12 FOMO-triggered trades this month.",
    severity: "danger",
  },
];

const severityStyles: Record<string, string> = {
  warning: "border-l-yellow-500 bg-yellow-500/5",
  info: "border-l-primary bg-primary/5",
  danger: "border-l-chart-red bg-chart-red/5",
};

const iconStyles: Record<string, string> = {
  warning: "text-yellow-500",
  info: "text-primary",
  danger: "text-chart-red",
};

const AIInsights = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-accent/4 rounded-full blur-[130px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">AI Insights</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 mb-4 font-display">
            Insights You'd <span className="gradient-text">Never Find</span> Alone
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real examples of what our AI discovers in your trading data.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className={`glass-card p-5 border-l-4 rounded-l-none ${severityStyles[insight.severity]}`}
            >
              <div className="flex items-start gap-4">
                <insight.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyles[insight.severity]}`} />
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {insight.type}
                  </span>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIInsights;
