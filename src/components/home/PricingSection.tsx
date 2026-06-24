import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLivePlans } from "@/hooks/useSiteContent";

const FALLBACK = [
  { slug: "free", name: "Free", monthly_price: 0, yearly_price: 0, features: ["Manual trade logging", "Basic statistics"], sort_order: 1 },
  { slug: "pro", name: "Pro", monthly_price: 19, yearly_price: 150, features: ["Unlimited trades", "Full AI Coach"], sort_order: 2 },
];

const PricingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const livePlans = useLivePlans();
  const plans = livePlans.length ? livePlans : FALLBACK;
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");


  return (
    <section className="section-padding" ref={ref} id="pricing">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">Start Free, Scale When Ready</h2>
        </motion.div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full border border-border/60 bg-card/40 backdrop-blur">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billing === b ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {b === "monthly" ? "Monthly" : "Yearly"}
                {b === "yearly" && <span className="ml-2 text-xs text-primary-foreground/80">Save 35%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan: any, i: number) => {
            const highlighted = plan.slug === "starter" || (plans.length === 2 && i === 0);
            const isFree = Number(plan.monthly_price) === 0;
            const features = Array.isArray(plan.features) ? plan.features : [];
            const price = billing === "yearly"
              ? Number(plan.yearly_price ?? plan.monthly_price * 12 * 0.65)
              : Number(plan.monthly_price);
            const suffix = isFree ? "forever" : billing === "yearly" ? "/year" : "/month";
            return (
              <motion.div
                key={plan.id ?? plan.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`glass-card p-6 flex flex-col relative ${highlighted ? "border-primary/50 neon-glow" : ""}`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-black text-foreground font-mono">${price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{suffix}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description ?? ""}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f: string, j: number) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to={isFree ? "/signup" : "/signup?plan=pro"}>
                  <Button className={highlighted ? "neon-glow w-full" : "w-full"} variant={highlighted ? "default" : "outline"}>
                    {isFree ? "Get Started" : `Get ${plan.name}`}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
