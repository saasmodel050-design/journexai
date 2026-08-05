import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, LineChart, Target, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: Brain,
    title: "AI That Studies You",
    desc: "Every trade you log is analyzed for emotional patterns, revenge trades, over-trading, and setup drift.",
  },
  {
    icon: LineChart,
    title: "Performance Analytics",
    desc: "Win rate, R:R, expectancy, session performance, and pair-level P&L — updated the moment you log a trade.",
  },
  {
    icon: Target,
    title: "Personalized Coaching",
    desc: "Get weekly reviews, mistake reports, and playbook suggestions built from your actual trading history.",
  },
  {
    icon: ShieldCheck,
    title: "Built For Serious Traders",
    desc: "Crypto, forex, and futures. Private by default, fast to log, and designed to make you consistent.",
  },
];

const WhatIsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding border-t border-border/40" ref={ref} id="what-is">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">What is Journex AI?</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-5">
            The trading journal that actually{" "}
            <span className="gradient-text">tells you what's wrong</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Journex AI is an AI-powered trading journal and coach. You log trades in seconds — we track
            performance, detect the emotional habits killing your edge, and give you clear steps to fix them.
            Think of it as a private analyst reviewing every trade you take.
          </p>
          <p className="text-sm text-muted-foreground mt-5">
            Research on trader behaviour backs this up: studies of retail traders find that overtrading and
            emotional decision-making systematically reduce returns — see{" "}
            <a
              href="https://faculty.haas.berkeley.edu/odean/papers/returns/individual%20investor%20performance%20final.pdf"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline underline-offset-4 hover:opacity-80"
            >
              Barber &amp; Odean, "Trading Is Hazardous to Your Wealth" (Journal of Finance)
            </a>{" "}
            and the{" "}
            <a
              href="https://www.esma.europa.eu/press-news/esma-news/esma-issues-warning-cfds-binary-options-and-other-speculative-products"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline underline-offset-4 hover:opacity-80"
            >
              ESMA warning on speculative retail trading products
            </a>
            .
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;
