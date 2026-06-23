import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Link2, TrendingUp, Users, Wallet, Zap, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useAffiliate } from "@/hooks/useAffiliate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const benefits = [
  { icon: DollarSign, title: "20% Commission", desc: "Earn 20% recurring commission on every Pro plan you refer." },
  { icon: TrendingUp, title: "30-Day Cookie", desc: "Get credit even if your referral signs up later — 30-day attribution." },
  { icon: Wallet, title: "Fast Payouts", desc: "Withdraw via PayPal or bank transfer once you hit the $50 minimum." },
  { icon: Zap, title: "Real-time Dashboard", desc: "Track clicks, conversions, and earnings live." },
];

const steps = [
  { n: "01", title: "Apply", desc: "Submit a 1-minute application." },
  { n: "02", title: "Get Approved", desc: "We approve genuine creators within 24 hours." },
  { n: "03", title: "Share Your Link", desc: "Get your unique referral link & assets." },
  { n: "04", title: "Earn", desc: "Get 20% on every Pro upgrade you refer." },
];

export default function Affiliate() {
  const { user } = useAuth();
  const { affiliate, refresh } = useAffiliate();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: user?.email ?? "", country: "", social_url: "", motivation: "" });

  const onCTA = () => {
    if (!user) { navigate("/login?next=/affiliate"); return; }
    if (affiliate) { navigate("/affiliate/dashboard"); return; }
    setForm((f) => ({ ...f, email: user.email ?? f.email }));
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name || !form.email || !form.country) { toast.error("Please fill required fields"); return; }
    setSubmitting(true);
    const { error } = await (supabase as any).from("affiliates").insert({
      user_id: user.id,
      full_name: form.full_name,
      email: form.email.toLowerCase(),
      country: form.country,
      social_url: form.social_url || null,
      motivation: form.motivation || null,
      status: "active", // auto-approve for now (admin can ban)
      approved_at: new Date().toISOString(),
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome aboard! Your affiliate account is active.");
    setOpen(false);
    await refresh();
    navigate("/affiliate/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Affiliate Program — Earn 20% with Journex Ai"
        description="Promote Journex Ai and earn recurring 20% commissions on every Pro plan referral with real-time tracking and fast payouts."
        path="/affiliate"
      />
      <Navbar />


      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 trading-grid overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary mb-5">
            <Zap className="h-3 w-3" /> JournexAI Affiliate Program
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
            Earn <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-400 bg-clip-text text-transparent">20% recurring</span><br />
            for every trader you refer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Promote the AI trading journal traders love. Get a unique link, real-time tracking, and reliable payouts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={onCTA} className="neon-glow">
              {affiliate ? "Open Affiliate Dashboard" : "Join Affiliate Program"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            {affiliate && (
              <span className="text-sm text-muted-foreground">
                Status: <span className="text-primary font-semibold capitalize">{affiliate.status}</span>
              </span>
            )}
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} viewport={{ once: true }}
              className="glass-card p-6 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-3">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="font-semibold mb-1">{b.title}</div>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <div key={s.n} className="glass-card p-5 relative">
                <div className="text-3xl font-bold bg-gradient-to-br from-primary to-purple-500 bg-clip-text text-transparent mb-2">{s.n}</div>
                <div className="font-semibold mb-1">{s.title}</div>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission detail */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto glass-card p-8 md:p-10 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 border-primary/30">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Commission & Payouts</h2>
          <ul className="space-y-2.5 text-sm text-foreground/90 mb-6">
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> 20% commission on every Pro plan purchase</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> 30-day referral attribution window</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> $50 minimum payout via PayPal or bank</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Payouts processed within 7 business days of approval</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /> Live tracking — clicks, signups, sales & earnings</li>
          </ul>
          <Button size="lg" onClick={onCTA} className="neon-glow">
            {affiliate ? "Go to Dashboard" : "Apply to Join"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </section>

      <Footer />

      {/* Apply modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Affiliate Application</DialogTitle>
            <DialogDescription>Join in under a minute. We'll generate your unique referral link instantly.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>Social / Website (optional)</Label>
              <Input value={form.social_url} onChange={(e) => setForm({ ...form, social_url: e.target.value })} placeholder="https://..." maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label>Why do you want to join? (optional)</Label>
              <Textarea value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} maxLength={500} rows={3} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full neon-glow">
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
