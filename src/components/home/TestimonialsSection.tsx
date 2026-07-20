import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    role: "Crypto Day Trader",
    quote:
      "Journex flagged my revenge trades within the first week. My win rate went from 48% to 61% in two months just by cutting one habit.",
    result: "+13% win rate",
  },
  {
    name: "Priya S.",
    role: "Forex Swing Trader",
    quote:
      "The AI coach is the closest thing to having a mentor review every trade. I finally trade my plan instead of my mood.",
    result: "3x R:R avg",
  },
  {
    name: "Daniel R.",
    role: "Futures Scalper",
    quote:
      "I've tried every journal on the market. This is the only one that actually tells me what to fix instead of just showing pretty charts.",
    result: "Cut losses 42%",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Loved by traders</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            Real traders. <span className="gradient-text">Real results.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Thousands of crypto, forex, and futures traders use Journex AI to break bad habits and trade with
            discipline.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl flex flex-col"
            >
              <Quote className="w-6 h-6 text-primary/60 mb-4" />
              <p className="text-foreground/90 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <span className="text-xs font-mono text-chart-green bg-chart-green/10 border border-chart-green/20 px-2 py-1 rounded-full">
                  {t.result}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
