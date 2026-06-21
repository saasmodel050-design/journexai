import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Copy, Check, ShieldCheck, Crown, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLivePlans } from "@/hooks/useSiteContent";

const PRO_FEATURES = [
  "Unlimited Trades",
  "Advanced Analytics",
  "AI Mistake Detection",
  "AI Trading Coach",
  "Weekly Performance Reports",
];

const EXPERIENCES = ["Beginner", "Intermediate", "Advanced", "Professional"];

interface Wallet {
  id: string;
  method: string;
  label: string;
  network: string;
  address: string;
  active: boolean;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const livePlans = useLivePlans();
  const proPlan = livePlans.find((p: any) => p.slug === 'pro' || p.slug === 'plan-pro' || p.name?.toLowerCase() === 'pro');
  const PRO_PRICE = Number(proPlan?.monthly_price ?? 39);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("usdt_trc20");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    telegram: "",
    country: "",
    experience: "Beginner",
  });
  const [verify, setVerify] = useState({ txid: "", notes: "" });
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("payment_wallets" as any)
        .select("*")
        .eq("active", true)
        .order("sort_order");
      const list = (data as any as Wallet[]) || [];
      setWallets(list);
      if (list[0]) setSelectedMethod(list[0].method);
    })();
    if (user?.email) setForm((f) => ({ ...f, email: user.email || "" }));
  }, [user?.email]);

  const wallet = useMemo(
    () => wallets.find((w) => w.method === selectedMethod),
    [wallets, selectedMethod]
  );

  const copyAddress = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const continueToPayment = () => {
    if (!form.full_name || !form.email || !form.country) {
      toast.error("Please fill all required fields");
      return;
    }
    setStep(2);
  };

  const submitProof = async () => {
    if (!user || !wallet) return;
    if (!verify.txid || verify.txid.length < 8) {
      toast.error("Please enter a valid transaction hash (TXID)");
      return;
    }
    setSubmitting(true);
    try {
      let screenshot_url: string | null = null;
      if (proofFile) {
        if (proofFile.size > 5 * 1024 * 1024) throw new Error("Screenshot must be under 5MB");
        const ext = proofFile.name.split(".").pop() || "png";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("payment-proofs")
          .upload(path, proofFile, { upsert: false });
        if (upErr) throw upErr;
        screenshot_url = path;
      }

      const { error } = await supabase.from("crypto_payments" as any).insert({
        user_id: user.id,
        full_name: form.full_name,
        email: form.email,
        telegram: form.telegram || null,
        country: form.country,
        experience: form.experience,
        plan: "pro",
        amount: PRO_PRICE,
        method: wallet.method,
        network: wallet.network,
        wallet_address: wallet.address,
        txid: verify.txid.trim(),
        screenshot_url,
        notes: verify.notes || null,
        status: "pending",
      });
      if (error) {
        if (error.code === "23505") throw new Error("This transaction hash was already submitted.");
        throw error;
      }
      setStep(3);
    } catch (e: any) {
      toast.error(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const qrUrl = wallet
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=0f172a&color=ffffff&qzone=2&data=${encodeURIComponent(
        wallet.address
      )}`
    : "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-primary/30">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Pro Plan Checkout</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure cryptocurrency payment · Activated after verification
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${PRO_PRICE}</div>
            <div className="text-xs text-muted-foreground">/month</div>
          </div>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" /> {f}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 mt-5 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Encrypted submission · Manual verification within 5 min – 24 h
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 text-xs">
        {["Details", "Payment", "Done"].map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : done
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-muted/30 text-muted-foreground border-border"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Your details</h2>
          <p className="text-xs text-muted-foreground -mt-3">
            Your subscription will be activated after payment verification.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
            </div>
            <div>
              <Label>Telegram Username</Label>
              <Input placeholder="@username" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} maxLength={50} />
            </div>
            <div>
              <Label>Country *</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} maxLength={80} />
            </div>
            <div className="sm:col-span-2">
              <Label>Trading Experience</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              >
                {EXPERIENCES.map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={continueToPayment} className="w-full neon-glow">
            Continue to Payment
          </Button>
        </div>
      )}

      {step === 2 && wallet && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 glass-card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Select method</h2>
            {wallets.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedMethod(w.method)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedMethod === w.method
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40 bg-muted/20"
                }`}
              >
                <div className="font-semibold text-sm">{w.label}</div>
                <div className="text-xs text-muted-foreground">{w.network} · lower fees</div>
              </button>
            ))}
            {wallets.length === 0 && (
              <p className="text-xs text-muted-foreground">No payment methods configured. Please contact support.</p>
            )}
          </div>

          <div className="lg:col-span-3 glass-card p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Amount</div>
                <div className="font-bold text-lg">{PRO_PRICE} {wallet.method.startsWith("usdt") ? "USDT" : wallet.method.toUpperCase()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Network</div>
                <div className="font-bold text-lg">{wallet.network}</div>
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-4 border border-border/60">
              <div className="text-xs text-muted-foreground mb-2">Wallet Address</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all text-xs bg-muted/40 p-2 rounded">{wallet.address}</code>
                <Button size="sm" variant="outline" onClick={copyAddress}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex justify-center mt-4">
                <img src={qrUrl} alt="Payment QR" className="rounded-lg border border-border/60" />
              </div>
              <p className="text-[11px] text-amber-400/90 text-center mt-3">
                ⚠️ Send exactly {PRO_PRICE} {wallet.method.startsWith("usdt") ? "USDT" : wallet.method.toUpperCase()} on the {wallet.network} network. Wrong network = lost funds.
              </p>
            </div>

            <div className="border-t border-border/60 pt-5 space-y-3">
              <h3 className="font-semibold">After sending, submit payment proof</h3>
              <div>
                <Label>Transaction Hash (TXID) *</Label>
                <Input
                  value={verify.txid}
                  onChange={(e) => setVerify({ ...verify, txid: e.target.value })}
                  placeholder="Paste your TXID here"
                  maxLength={200}
                />
              </div>
              <div>
                <Label>Screenshot (optional, max 5MB)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={verify.notes}
                  onChange={(e) => setVerify({ ...verify, notes: e.target.value })}
                  maxLength={500}
                  rows={2}
                />
              </div>
              <Button onClick={submitProof} className="w-full neon-glow" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                I Have Completed Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">Payment Submitted Successfully</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Your payment is under review. Verification usually takes 5 minutes to 24 hours. You'll receive an email when your Pro Plan is activated.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      )}
    </div>
  );
}
