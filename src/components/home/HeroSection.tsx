import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated wave background */}
      <div className="wave-bg" />
      <div className="absolute inset-0 particles-bg opacity-40" />

      {/* Gradient orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-neon-blue/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text content */}
          <div className="text-left">
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
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] mb-6 font-display"
            >
              TradeMind{" "}
              <span className="gradient-text">AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-xl sm:text-2xl text-foreground/80 font-medium mb-4"
            >
              Your AI Trading Coach That{" "}
              <span className="text-primary">Finds Your Mistakes</span>{" "}
              Before They Cost You Money
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-muted-foreground max-w-lg mb-10 leading-relaxed"
            >
              Track trades, detect emotional trading patterns, and improve your performance with 
              AI-powered analytics. Stop repeating costly mistakes and start trading consistently.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link to="/signup">
                <Button size="lg" className="neon-glow text-base px-8 py-6 font-semibold bg-primary hover:bg-primary/90">
                  Start Journaling Trades
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50">
                  <Play className="w-4 h-4 mr-2" />
                  Try Demo Dashboard
                </Button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-8 mt-14"
            >
              {[
                { value: "12K+", label: "Active Traders" },
                { value: "2.4M", label: "Trades Analyzed" },
                { value: "34%", label: "Avg. Improvement" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-black text-primary font-mono neon-text">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="glass-card p-2 rounded-2xl neon-glow relative">
              <img
                src={dashboardPreview}
                alt="TradeMind AI Dashboard showing trading analytics, win rate, profit/loss chart, and AI insights"
                className="w-full rounded-xl"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-4 glass-card px-4 py-3 rounded-xl border-primary/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-green" />
                <span className="text-sm font-mono text-foreground">Win Rate: 68.5%</span>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 glass-card px-4 py-3 rounded-xl border-primary/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-foreground">AI: Detected FOMO pattern</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
