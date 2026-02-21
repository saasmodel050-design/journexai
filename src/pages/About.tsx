import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Target, TrendingDown, Brain, Eye } from "lucide-react";

const sections = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To help every trader become disciplined and data-driven. We believe that with the right tools, any trader can break bad habits and achieve consistent performance.",
  },
  {
    icon: TrendingDown,
    title: "Why Traders Fail",
    text: "Most traders don't fail because of bad strategies — they fail because they repeat the same emotional mistakes without realizing it. Without structured data, it's impossible to identify patterns that silently destroy profits.",
  },
  {
    icon: Brain,
    title: "How AI Helps Traders Improve",
    text: "Our AI analyzes thousands of trades to detect patterns humans can't see. From emotional triggers to session performance, it surfaces actionable insights that help you build an edge through self-awareness.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "We envision a future where every retail trader has access to institutional-level performance analytics. AI-powered coaching will bridge the gap between amateur and professional trading.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="text-sm font-medium text-primary uppercase tracking-wider">About Us</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              Built by Traders, <span className="gradient-text">For Traders</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Most traders lose money because they repeat mistakes they don't even know they're making.
              TradeMind AI was built to solve this — a platform that turns your trading data into a personal performance coach.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
