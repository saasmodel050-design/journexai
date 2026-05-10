import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, ExternalLink, DollarSign, Users, MousePointerClick, TrendingUp, Wallet, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAffiliate } from "@/hooks/useAffiliate";
import { supabase } from "@/integrations/supabase/client";
import { affiliateUrl } from "@/lib/referral";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import journexLogo from "@/assets/journex_logo.png";

function StatCard({ icon: Icon, label, value, accent = "primary" }: any) {
  return (
    <Card className="p-5 glass-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-${accent}/15 border border-${accent}/30 flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}

export default function AffiliateDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { affiliate, loading, refresh } = useAffiliate();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!affiliate) return;
    setPaypalEmail(affiliate.paypal_email ?? "");
    const loadAll = async () => {
      const [{ data: refs }, { data: coms }, { data: pays }] = await Promise.all([
        (supabase as any).from("referrals").select("*").eq("affiliate_id", affiliate.id).order("signup_date", { ascending: false }),
        (supabase as any).from("commissions").select("*").eq("affiliate_id", affiliate.id).order("created_at", { ascending: false }),
        (supabase as any).from("payouts").select("*").eq("affiliate_id", affiliate.id).order("requested_at", { ascending: false }),
      ]);
      setReferrals(refs ?? []);
      setCommissions(coms ?? []);
      setPayouts(pays ?? []);
      const now = new Date();
      const buckets: { month: string; earnings: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({ month: d.toLocaleString("en", { month: "short" }), earnings: 0 });
      }
      (coms ?? []).forEach((c: any) => {
        const d = new Date(c.created_at);
        const idx = buckets.findIndex(b => b.month === d.toLocaleString("en", { month: "short" }) && d >= new Date(now.getFullYear(), now.getMonth() - 5, 1));
        if (idx >= 0) buckets[idx].earnings += Number(c.commission_amount || 0);
      });
      setChartData(buckets);
    };
    loadAll();

    // Realtime subscriptions
    const ch = supabase
      .channel(`aff_${affiliate.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "referrals", filter: `affiliate_id=eq.${affiliate.id}` }, () => { loadAll(); refresh(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "commissions", filter: `affiliate_id=eq.${affiliate.id}` }, () => { loadAll(); refresh(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "payouts", filter: `affiliate_id=eq.${affiliate.id}` }, () => { loadAll(); refresh(); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "affiliates", filter: `id=eq.${affiliate.id}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [affiliate, refresh]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!user) return <Navigate to="/login?next=/affiliate/dashboard" replace />;
  if (!affiliate) return <Navigate to="/affiliate" replace />;

  const refLink = affiliateUrl(affiliate.referral_code);

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    toast.success("Referral link copied");
  };

  const requestPayout = async () => {
    const amount = Number(payoutAmount);
    if (!amount || amount < 50) { toast.error("Minimum payout is $50"); return; }
    if (amount > Number(affiliate.pending_earnings)) { toast.error("Amount exceeds pending earnings"); return; }
    if (!paypalEmail) { toast.error("Add a PayPal email"); return; }
    setRequesting(true);
    await (supabase as any).from("affiliates").update({ paypal_email: paypalEmail }).eq("id", affiliate.id);
    const { error } = await (supabase as any).from("payouts").insert({
      affiliate_id: affiliate.id, amount, method: "paypal",
      destination: { paypal_email: paypalEmail }, status: "pending",
    });
    setRequesting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Payout request submitted");
    setPayoutOpen(false);
    const { data: pays } = await (supabase as any).from("payouts").select("*").eq("affiliate_id", affiliate.id).order("requested_at", { ascending: false });
    setPayouts(pays ?? []);
    refresh();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&bgcolor=0F172A&color=FFFFFF&data=${encodeURIComponent(refLink)}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <header className="border-b border-border/50 bg-card/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={journexLogo} alt="Journex Ai" className="w-8 h-8 rounded-lg" />
            <span className="font-bold">Journex Affiliate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/40 text-primary capitalize">{affiliate.status}</Badge>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Trading dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {affiliate.status !== "active" && (
          <div className="glass-card p-4 border-amber-500/40 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              Your affiliate account is <span className="font-semibold capitalize">{affiliate.status}</span>. You can still browse, but commissions are paused until activation.
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your performance and request payouts.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={MousePointerClick} label="Clicks" value={affiliate.total_clicks} />
          <StatCard icon={Users} label="Referrals" value={affiliate.total_referrals} />
          <StatCard icon={TrendingUp} label="Paid Users" value={affiliate.total_conversions} />
          <StatCard icon={DollarSign} label="Total Earnings" value={`$${Number(affiliate.total_earnings).toFixed(2)}`} />
          <StatCard icon={Wallet} label="Pending" value={`$${Number(affiliate.pending_earnings).toFixed(2)}`} />
          <StatCard icon={Wallet} label="Paid Out" value={`$${Number(affiliate.paid_earnings).toFixed(2)}`} />
        </div>

        {/* Referral link + QR */}
        <Card className="glass-card p-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Your Referral Link</div>
              <div className="flex flex-wrap gap-2">
                <Input readOnly value={refLink} className="bg-secondary/40 font-mono text-sm" />
                <Button onClick={copyLink}><Copy className="w-4 h-4 mr-1.5" /> Copy</Button>
                <Button variant="outline" asChild><a href={refLink} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a></Button>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Code: <span className="font-mono text-primary">{affiliate.referral_code}</span> · Commission: <span className="text-primary font-semibold">{affiliate.commission_rate}%</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img src={qrUrl} alt="QR" className="rounded-lg border border-border/60 bg-card" width={140} height={140} />
              <span className="text-xs text-muted-foreground">Scan to share</span>
            </div>
          </div>
        </Card>

        {/* Earnings chart */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Earnings — last 6 months</div>
              <div className="text-xs text-muted-foreground">Based on approved commissions</div>
            </div>
            <Button onClick={() => setPayoutOpen(true)}>Request Payout</Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="referrals">
          <TabsList>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <Card className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Signup</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No referrals yet — share your link!</TableCell></TableRow>}
                  {referrals.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.referred_email ?? "—"}</TableCell>
                      <TableCell>{new Date(r.signup_date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{r.plan ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{r.conversion_status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sale</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No commissions yet</TableCell></TableRow>}
                  {commissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>${Number(c.sale_amount).toFixed(2)}</TableCell>
                      <TableCell className="text-primary font-semibold">${Number(c.commission_amount).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{c.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requested</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No payout requests yet</TableCell></TableRow>}
                  {payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{new Date(p.requested_at).toLocaleDateString()}</TableCell>
                      <TableCell>${Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{p.method}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Payout dialog */}
      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Available: <span className="text-primary font-semibold">${Number(affiliate.pending_earnings).toFixed(2)}</span> · Minimum $50
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>PayPal Email</Label>
              <Input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="you@paypal.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (USD)</Label>
              <Input type="number" min={50} value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} placeholder="50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>Cancel</Button>
            <Button onClick={requestPayout} disabled={requesting}>{requesting ? "Submitting…" : "Submit Request"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
