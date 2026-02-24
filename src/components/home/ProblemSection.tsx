import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { XCircle, RefreshCw, Brain, BookX, AlertTriangle } from "lucide-react";

const problems = [
  { icon: BookX, text: "They don't track their trades" },
  { icon: RefreshCw, text: "They repeat the same mistakes over and over" },
  { icon: Brain, text: "Emotional decisions destroy their profits" },
  { icon: AlertTriangle, text: "No structured journal or review process" },
  { icon: XCircle, text: "Risk management is inconsistent" },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="absolute inset-0 candlestick-bg opacity-40" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-destructive/4 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-chart-red uppercase tracking-wider">The Problem</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 mb-4 font-display">
            Most Traders <span className="text-chart-red">Fail</span> Because…
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            90% of retail traders lose money. Not because of bad strategies — because of bad habits they never identify.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card p-5 flex items-start gap-4 group hover:border-chart-red/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-chart-red/10 flex items-center justify-center flex-shrink-0">
                <problem.icon className="w-5 h-5 text-chart-red" />
              </div>
              <p className="text-sm text-foreground font-medium leading-relaxed">{problem.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
