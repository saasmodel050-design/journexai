import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Check, X, ExternalLink, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

interface Payment {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  telegram: string | null;
  country: string | null;
  plan: string;
  amount: number;
  method: string;
  network: string;
  wallet_address: string;
  txid: string;
  screenshot_url: string | null;
  notes: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

interface WalletRow {
  id: string;
  method: string;
  label: string;
  network: string;
  address: string;
  active: boolean;
}

export default function AdminPayments() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"payments" | "wallets">("payments");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [rejectFor, setRejectFor] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [p, w] = await Promise.all([
      supabase.from("crypto_payments" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("payment_wallets" as any).select("*").order("sort_order"),
    ]);
    setPayments(((p.data as any) || []) as Payment[]);
    setWallets(((w.data as any) || []) as WalletRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "crypto_payments" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = payments.filter((p) => filter === "all" || p.status === filter);

  const approve = async (p: Payment) => {
    const { error } = await supabase
      .from("crypto_payments" as any)
      .update({ status: "approved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(`Pro Plan activated for ${p.email}`);
  };

  const reject = async () => {
    if (!rejectFor || !rejectReason.trim()) return toast.error("Rejection reason required");
    const { error } = await supabase
      .from("crypto_payments" as any)
      .update({
        status: "rejected",
        rejection_reason: rejectReason,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", rejectFor.id);
    if (error) return toast.error(error.message);
    toast.success("Payment rejected");
    setRejectFor(null);
    setRejectReason("");
  };

  const viewProof = async (path: string) => {
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 300);
    if (error) return toast.error(error.message);
    setProofUrl(data.signedUrl);
  };

  const saveWallet = async (w: WalletRow) => {
    const { error } = await supabase
      .from("payment_wallets" as any)
      .update({ address: w.address, active: w.active, label: w.label, network: w.network })
      .eq("id", w.id);
    if (error) return toast.error(error.message);
    toast.success("Wallet updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Crypto Payments</h1>
          <p className="text-sm text-muted-foreground">Verify Pro plan crypto payments and manage receiving wallets.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === "payments" ? "default" : "outline"} size="sm" onClick={() => setTab("payments")}>Payments</Button>
          <Button variant={tab === "wallets" ? "default" : "outline"} size="sm" onClick={() => setTab("wallets")}>
            <Wallet className="w-4 h-4 mr-1" /> Wallets
          </Button>
        </div>
      </div>

      {tab === "payments" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(["pending", "approved", "rejected", "all"] as const).map((s) => (
              <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
                {s} ({payments.filter((p) => s === "all" || p.status === s).length})
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Plan</th>
                    <th className="text-left p-3">Method</th>
                    <th className="text-left p-3">TXID</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-border/40">
                      <td className="p-3">
                        <div className="font-medium">{p.full_name}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </td>
                      <td className="p-3">
                        <div>{p.plan}</div>
                        <div className="text-xs text-muted-foreground">${p.amount}</div>
                      </td>
                      <td className="p-3">
                        <div>{p.method.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">{p.network}</div>
                      </td>
                      <td className="p-3 max-w-[180px]">
                        <code className="text-xs break-all">{p.txid}</code>
                        {p.screenshot_url && (
                          <button onClick={() => viewProof(p.screenshot_url!)} className="text-xs text-primary flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" /> Screenshot
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-xs">{new Date(p.created_at).toLocaleString()}</td>
                      <td className="p-3">
                        <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>
                          {p.status}
                        </Badge>
                        {p.status === "rejected" && p.rejection_reason && (
                          <div className="text-[11px] text-muted-foreground mt-1 max-w-[160px]">{p.rejection_reason}</div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {p.status === "pending" && (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" onClick={() => approve(p)}>
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setRejectFor(p)}>
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="p-6 text-center text-muted-foreground text-sm">No payments</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "wallets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((w) => (
            <div key={w.id} className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{w.label}</div>
                  <div className="text-xs text-muted-foreground">{w.network}</div>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={w.active}
                    onChange={(e) => setWallets((ws) => ws.map((x) => (x.id === w.id ? { ...x, active: e.target.checked } : x)))}
                  />
                  Active
                </label>
              </div>
              <Input
                value={w.address}
                onChange={(e) => setWallets((ws) => ws.map((x) => (x.id === w.id ? { ...x, address: e.target.value } : x)))}
              />
              <Button size="sm" onClick={() => saveWallet(w)}>Save</Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject payment</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Provide a reason — the user will see it in their email.</p>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} maxLength={500} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={reject}>Confirm Rejection</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!proofUrl} onOpenChange={(o) => !o && setProofUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Payment Screenshot</DialogTitle></DialogHeader>
          {proofUrl && <img src={proofUrl} alt="Proof" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
