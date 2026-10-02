import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLivePlans } from "@/hooks/useSiteContent";
import { useNavigate } from "react-router-dom";
import { startProCheckout } from "@/lib/checkout";
import { PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE, FREE_FEATURES, FREE_LIMIT_SUMMARY, yearlyDiscountPercent, isProPlan } from "@/lib/plans";

const FALLBACK = [
  { slug: "free", name: "Free", monthly_price: 0, yearly_price: 0, features: FREE_FEATURES, sort_order: 1 },
  { slug: "pro", name: "Pro", monthly_price: PRO_MONTHLY_PRICE, yearly_price: PRO_YEARLY_PRICE, features: ["Unlimited trades", "Full AI Coach"], sort_order: 2 },
];

const PricingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const livePlans = useLivePlans();
  const plans = livePlans.length ? livePlans : FALLBACK;
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const navigate = useNavigate();
  const pro = plans.find(isProPlan);
  const savePct = yearlyDiscountPercent(Number(pro?.monthly_price ?? PRO_MONTHLY_PRICE), Number(pro?.yearly_price ?? PRO_YEARLY_PRICE));


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
          <p className="text-muted-foreground">{FREE_LIMIT_SUMMARY}</p>
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
                {b === "yearly" && savePct > 0 && <span className="ml-2 text-xs text-primary-foreground/80">Save {savePct}%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan: any, i: number) => {
            const highlighted = isProPlan(plan);
            const isFree = Number(plan.monthly_price) === 0;
            const features = isFree ? FREE_FEATURES : Array.isArray(plan.features) ? plan.features : [];
            const price = billing === "yearly"
              ? Number(plan.yearly_price ?? 0)
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
                {plan.description ? <p className="text-sm text-muted-foreground mb-6">{plan.description}</p> : <div className="mb-6" />}
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f: string, j: number) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={highlighted ? "neon-glow w-full" : "w-full"}
                  variant={highlighted ? "default" : "outline"}
                  onClick={() => {
                    if (isFree) navigate("/signup");
                    else startProCheckout(billing, (p) => navigate(p));
                  }}
                >
                  {isFree ? "Get Started" : `Get ${plan.name}`}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
