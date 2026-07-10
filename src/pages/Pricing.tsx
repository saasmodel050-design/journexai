import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/home/PricingSection";
import Seo from "@/components/Seo";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Pricing — Journex Ai"
        description="Simple, transparent pricing for Journex Ai. Start free and upgrade when you're ready to unlock the full AI trading coach."
        path="/pricing"
      />
      <Navbar />
      <main className="pt-24">
        <section className="container mx-auto px-4 text-center pb-4">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your trading journey. Cancel anytime.
          </p>
        </section>
        <PricingSection />
        <section className="container mx-auto px-4 py-16 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: "Can I try Journex Ai for free?", a: "Yes. The Free plan lets you log trades and explore the dashboard with no time limit." },
              { q: "Can I switch plans later?", a: "Absolutely. Upgrade or downgrade any time from your dashboard." },
              { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee on Pro subscriptions. Contact support to request one." },
              { q: "What payment methods do you accept?", a: "Payments are handled by our upcoming payment partner. We'll notify all users once live checkout is available." },
            ].map((f) => (
              <div key={f.q} className="glass-card p-5">
                <div className="font-semibold mb-1">{f.q}</div>
                <div className="text-sm text-muted-foreground">{f.a}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
