import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Brain, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Add Your Trades",
    desc: "Import trades from your broker or log them manually in seconds. Supports all major platforms.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analyzes Patterns",
    desc: "Our AI scans your history to find mistakes, emotional patterns, and areas for improvement.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Improve Performance",
    desc: "Get actionable insights and track your progress as you develop better trading habits.",
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="section-padding relative" ref={ref}>
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-primary/4 rounded-full blur-[130px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 font-display">
            Three Steps to <span className="gradient-text">Better Trading</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="text-center relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 relative group hover:bg-primary/15 transition-colors">
                <s.icon className="w-8 h-8 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center font-mono">
                  {s.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
