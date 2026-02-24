import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

const stats = [
  { label: "Win Rate", value: "68.5%", change: "+3.2%", positive: true },
  { label: "Monthly PnL", value: "$4,280", change: "+12.4%", positive: true },
  { label: "Avg RR Ratio", value: "2.1:1", change: "+0.3", positive: true },
  { label: "Trade Count", value: "142", change: "This month", positive: true },
];

const DashboardPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 trading-grid opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Dashboard Preview</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 mb-4 font-display">
            Your Trading <span className="gradient-text">Command Center</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need at a glance — performance metrics, AI insights, and detailed analytics.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8"
        >
          {stats.map((s, i) => (
            <div key={i} className="glass-card p-4 text-center group hover:border-primary/30 transition-colors">
              <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
              <div className="text-xl font-black font-mono text-foreground">{s.value}</div>
              <div className={`text-xs font-mono mt-1 ${s.positive ? "text-chart-green" : "text-chart-red"}`}>
                {s.change}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto glass-card p-2 rounded-2xl neon-glow"
        >
          <img
            src={dashboardPreview}
            alt="TradeMind AI full dashboard preview"
            className="w-full rounded-xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
