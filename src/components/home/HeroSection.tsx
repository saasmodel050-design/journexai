import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import dashboardPreview from "@/assets/dashboard-preview.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";

const HeroSection = () => {
  const c = useSiteContent("home", "hero", {
    badge: "AI-Powered Trading Intelligence",
    title: "Your AI Trading Coach That Finds Your Mistakes Before They Cost You Money",
    subtitle: "Track trades, detect emotional trading, and improve performance with AI-powered insights. Stop repeating costly mistakes and start trading consistently.",
    cta_primary: "Start Journaling Trades",
    cta_secondary: "Try Demo Dashboard",
  });
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 trading-grid opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI-Powered Trading Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
          >
            Your AI Trading Coach That{" "}
            <span className="gradient-text">Finds Your Mistakes</span>{" "}
            Before They Cost You Money
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Track trades, detect emotional trading, and improve performance with AI-powered insights.
            Stop repeating costly mistakes and start trading consistently.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup">
              <Button size="lg" className="neon-glow text-base px-8 py-6 font-semibold">
                Start Journaling Trades
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg" className="text-base px-8 py-6 border-border text-foreground hover:bg-secondary">
                <Play className="w-4 h-4 mr-2" />
                Try Demo Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-12 text-sm"
          >
            {[
              { value: "12K+", label: "Active Traders" },
              { value: "2.4M", label: "Trades Analyzed" },
              { value: "34%", label: "Avg. Improvement" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary font-mono">{stat.value}</div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="glass-card p-2 rounded-2xl neon-glow">
            <img
              src={dashboardPreview}
              alt="Journex Ai Dashboard showing trading analytics, win rate, profit/loss chart, and AI insights"
              className="w-full rounded-xl"
            />
          </div>
          {/* Floating cards */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-4 glass-card px-4 py-3 rounded-xl hidden lg:block"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-green" />
              <span className="text-sm font-mono text-foreground">Win Rate: 68.5%</span>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 -left-4 glass-card px-4 py-3 rounded-xl hidden lg:block"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-foreground">AI: Detected FOMO pattern</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
