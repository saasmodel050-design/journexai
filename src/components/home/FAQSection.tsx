import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const faqs = [
  {
    q: "What is an AI trading journal?",
    a: "An AI trading journal is a trade log that automatically analyses your entries, exits, risk, and emotions to find repeatable mistakes. Journex Ai reviews every trade you record and returns plain-English feedback on what cost you money and what to repeat.",
  },
  {
    q: "Who is Journex Ai for?",
    a: "Journex Ai is built for active crypto, forex, and futures traders — from funded-account and prop-firm traders to serious retail swing traders — who already take trades regularly and want to fix inconsistency rather than find new signals.",
  },
  {
    q: "How does Journex Ai find my trading mistakes?",
    a: "Short answer: it looks for patterns across your history, not single trades. It flags revenge trading, over-trading after losses, oversized positions, setup drift, and losing sessions or pairs, then ranks them by how much each pattern costs you.",
  },
  {
    q: "How long does it take to log a trade?",
    a: "About 20 seconds. You enter the pair, direction, entry, stop, target, size, session, and how you felt — analytics, win rate, expectancy, and R:R update instantly.",
  },
  {
    q: "Which markets and instruments are supported?",
    a: "Crypto, forex, futures, stocks, and options. You can log any instrument manually, and prices and P&L are recorded in your account currency.",
  },
  {
    q: "Is Journex Ai free?",
    a: "Yes. The Free plan lets you log trades and see core analytics with a daily and monthly trade limit. The Pro plan removes the limits and unlocks the AI Trainer, advanced insights, strategies, and reports, monthly or yearly.",
  },
  {
    q: "Is my trading data private?",
    a: "Yes. Your journal is private to your account, protected by row-level security, and encrypted in transit and at rest. We never sell or publish your trade data.",
  },
  {
    q: "When should I use Journex Ai?",
    a: "Use it after every trading session to log fills while they are fresh, and once a week to read your AI mistake report before planning the next week.",
  },
];

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding border-t border-border/40" ref={ref} id="faq">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-muted-foreground">
            Short, direct answers about the Journex Ai trading journal, plans, and privacy.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-foreground mb-2">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
