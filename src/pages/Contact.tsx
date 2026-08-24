import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Handshake, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


const faqs = [
  { q: "What markets does Journex Ai support?", a: "We support crypto, forex, futures, stocks, and options trading across all major brokers." },
  { q: "Can I import trades from my broker?", a: "Yes! We support CSV imports from most major brokers and platforms including MetaTrader, TradingView, and more." },
  { q: "Is my trading data secure?", a: "Absolutely. All data is encrypted at rest and in transit with enterprise-grade security." },
  { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel anytime. Your data remains accessible on the free plan." },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });
    setSending(false);
    if (error) {
      toast.error("Could not send your message. Please email journex.ai.trade@gmail.com.");
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  const faqJsonLd = {

    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Contact Journex Ai — Support, Partnerships & FAQs"
        description="Reach the Journex Ai team for product support, partnerships, and answers to common trading-journal questions."
        path="/contact"
        jsonLd={faqJsonLd}
      />
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Contact</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-4 mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
          </motion.div>

          <h2 className="sr-only">Contact options</h2>
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <h3 className="text-xl font-semibold text-foreground mb-6">Send us a message</h3>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="contact-name" className="text-sm text-muted-foreground mb-2 block">Name</label>
                  <input id="contact-name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-sm text-muted-foreground mb-2 block">Email</label>
                  <input id="contact-email" name="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-sm text-muted-foreground mb-2 block">Message</label>
                  <textarea id="contact-message" name="message" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition-colors resize-none" placeholder="How can we help?" />
                </div>
                <Button type="submit" disabled={sending} className="w-full neon-glow" size="lg">
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>

            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {[
                { icon: Mail, title: "Email", desc: "journex.ai.trade@gmail.com", mail: true },
                { icon: MessageSquare, title: "Support", desc: "Live chat available Mon-Fri, 9am-6pm EST", mail: false },
                { icon: Handshake, title: "Partnerships", desc: "journex.ai.trade@gmail.com", mail: true },
              ].map((item, i) => (
                <div key={i} className="glass-card-hover p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                    {item.mail ? (
                      <a
                        href={`mailto:${item.desc}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors mt-1 inline-block break-all"
                      >
                        {item.desc}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    )}
                  </div>
                </div>
              ))}


              {/* FAQ */}
              <div className="glass-card p-6 mt-6">
                <div className="flex items-center gap-2 mb-5">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Frequently Asked Questions</h4>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <div key={i}>
                      <h5 className="text-sm font-medium text-foreground mb-1">{faq.q}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
