import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Get started with basic journaling.",
    features: ["Manual trade logging", "Basic statistics", "Up to 50 trades/month", "Community access"],
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    desc: "Unlock AI insights and analytics.",
    features: [
      "Everything in Free",
      "AI Mistake Finder",
      "Emotion tracking",
      "Unlimited trades",
      "Performance dashboard",
      "Broker import",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    desc: "Full coaching and advanced analytics.",
    features: [
      "Everything in Starter",
      "AI Trading Coach",
      "Strategy optimization",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom reports",
    ],
    highlighted: false,
  },
];

const PricingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            Start Free, Scale When Ready
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`glass-card p-6 flex flex-col relative ${
                plan.highlighted ? "border-primary/50 neon-glow" : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-black text-foreground font-mono">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button
                  className={plan.highlighted ? "neon-glow w-full" : "w-full"}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
