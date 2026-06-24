import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Target,
  TrendingDown,
  Brain,
  Eye,
  Sparkles,
  ShieldCheck,
  Heart,
  LineChart,
  BookOpen,
  Bot,
  Users,
  Zap,
  Globe,
  Lock,
  Rocket,
  ArrowRight,
} from "lucide-react";

const beliefs = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To help every trader become disciplined, self-aware, and data-driven. We turn raw trade history into a personalized performance coach that works 24/7 — so traders can finally break the cycle of repeating the same mistakes.",
  },
  {
    icon: TrendingDown,
    title: "Why Traders Fail",
    text: "Most traders don't fail because of bad strategies — they fail because of FOMO, revenge trades, overconfidence, and ignored rules. Without structured emotional and behavioral data, these patterns stay invisible and silently destroy accounts.",
  },
  {
    icon: Brain,
    title: "How AI Helps You Improve",
    text: "Journex Ai analyzes every trade you log — entry, exit, emotion, session, strategy — and surfaces the patterns humans can't see. It tells you which setups actually print, which emotions cost you the most, and what to fix next.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "Retail traders deserve the same edge institutions have. We're building the world's first AI trading coach that combines journaling, analytics, and behavioral psychology — so any trader, anywhere, can compete at a professional level.",
  },
];

const stats = [
  { value: "10,000+", label: "Trades journaled" },
  { value: "5", label: "Emotions tracked per trade" },
  { value: "3", label: "Markets supported" },
  { value: "24/7", label: "AI coaching" },
];

const markets = [
  { icon: LineChart, name: "Crypto", desc: "Spot, perps, and futures across major exchanges." },
  { icon: Globe, name: "Forex", desc: "All major and minor pairs, session-aware analytics." },
  { icon: Zap, name: "Futures", desc: "Indices, commodities, and micro contracts." },
];

const features = [
  { icon: BookOpen, title: "Smart Trade Journal", desc: "Log technical and emotional data in under 30 seconds." },
  { icon: Brain, title: "AI Mistake Finder", desc: "Detects recurring patterns that silently kill your edge." },
  { icon: Heart, title: "Emotion Tracking", desc: "Tag trades with FOMO, revenge, fear, and confidence." },
  { icon: LineChart, title: "Performance Analytics", desc: "Win rate, R-multiples, expectancy, session breakdowns." },
  { icon: Bot, title: "AI Trading Coach", desc: "Personalized feedback trained on your real trade history." },
  { icon: ShieldCheck, title: "Private & Secure", desc: "Bank-grade encryption. Your data is never sold." },
];

const values = [
  { icon: Heart, title: "Trader-First", text: "Every feature is shipped by traders who've felt the same pain — blown accounts, missed lessons, broken discipline." },
  { icon: ShieldCheck, title: "Honest by Default", text: "No gambler marketing, no fake gurus. We help you face your numbers, even when they hurt." },
  { icon: Lock, title: "Your Data, Your Edge", text: "Your journal belongs to you. We encrypt it, we never sell it, and you can export or delete anytime." },
  { icon: Sparkles, title: "AI That Actually Helps", text: "We use AI to surface insights, not to gamble for you. The trader stays in control — always." },
];

const timeline = [
  { year: "2024", title: "The Spark", text: "Founders kept blowing accounts on the same emotional mistakes. Spreadsheets weren't enough — there had to be a smarter way." },
  { year: "Early 2025", title: "Prototype", text: "First version of the AI Mistake Finder built and tested on thousands of real trades from a private community of traders." },
  { year: "Mid 2025", title: "Public Beta", text: "Journex Ai opens to crypto, forex, and futures traders. The AI Trading Coach and Emotion Tracking launch." },
  { year: "2026", title: "Today", text: "Trial signups, affiliate program, advanced analytics, and a growing community of disciplined, data-driven traders." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="About Journex Ai — AI Trading Journal & Coach"
        description="Journex Ai turns your trading data into a personal AI coach for crypto, forex, and futures. Learn our mission, story, and how we help traders break bad habits."
        path="/about"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-sm font-medium text-primary uppercase tracking-wider">About Journex Ai</span>
            <h1 className="text-4xl sm:text-6xl font-bold mt-4 mb-6 leading-tight">
              Built by Traders, <span className="gradient-text">for Traders</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Most traders lose money because they repeat the same emotional mistakes — without ever realizing it.
              Journex Ai is the AI-powered trading journal and coach that exposes those patterns, so you can finally
              trade like a professional.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/start-trial">
                <Button size="lg" className="neon-glow">
                  Start 3-Day Pro Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline">
                  Try the Live Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 text-center"
              >
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Story</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">From Blown Accounts to AI Coaching</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
            <p>
              Journex Ai started the way most great trading tools do — out of frustration. Our founding team had been
              trading crypto, forex, and futures for years. We had strategies that worked on paper, backtests that
              looked beautiful, and yet our real accounts kept bleeding.
            </p>
            <p>
              The problem wasn't the strategy. It was us. <span className="text-foreground font-medium">FOMO entries.
              Revenge trades after losses. Moving stop-losses "just this once."</span> The same mistakes, over and
              over, hidden inside hundreds of spreadsheet rows nobody had time to read.
            </p>
            <p>
              We built the first version of Journex Ai to answer one question: <span className="text-foreground font-medium">
              "What if an AI could read every trade I've ever taken and tell me exactly what I'm doing wrong?"</span>
              That tool became the AI Mistake Finder — and the foundation of the platform you see today.
            </p>
            <p>
              Now Journex Ai helps thousands of traders across crypto, forex, and futures turn raw trade data into
              real, actionable self-awareness. No gurus. No signals. Just your data, brutally honest insights, and a
              coach that never sleeps.
            </p>
          </div>
        </div>
      </section>

      {/* Beliefs grid */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">What We Believe</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Trading Is a Mental Game</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {beliefs.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
      </section>

      {/* Markets */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Markets We Cover</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">One Journal. Every Market.</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Whether you trade Bitcoin perps at 3am or EURUSD during the London session, Journex Ai adapts to your
              market, your strategy, and your style.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {markets.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-8 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 mx-auto">
                  <m.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What we build */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">What We Build</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">A Complete Trading Performance Platform</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-card-hover p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">The Principles Behind Every Feature</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-6 flex gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">From Idea to AI Coach</h2>
          </div>
          <div className="relative border-l-2 border-primary/30 pl-8 space-y-10">
            {timeline.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="absolute -left-[42px] w-5 h-5 rounded-full bg-primary neon-glow" />
                <div className="text-sm font-mono text-primary mb-1">{t.year}</div>
                <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="glass-card max-w-4xl mx-auto p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">trade like a pro?</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Join the traders using Journex Ai to journal smarter, spot mistakes faster, and build the discipline
                that separates pros from gamblers.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/start-trial">
                  <Button size="lg" className="neon-glow">
                    Start 3-Day Pro Trial <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    <Users className="w-4 h-4 mr-2" /> Talk to the Team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
