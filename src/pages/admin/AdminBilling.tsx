import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Repeat, AlertCircle } from "lucide-react";
import { isProPlan } from "@/lib/plans";

type WebhookEvent = {
  event_id: string; event_type: string; email: string | null; amount: number | null;
  currency: string | null; status: string; error: string | null; created_at: string;
};
type Pending = { id: string; email: string; event: string; billing: string | null; created_at: string };

export default function AdminBilling() {
  const [data, setData] = useState({ mrr: 0, arr: 0, active: 0, problems: 0 });
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);

  useEffect(() => {
    (async () => {
      const db = supabase as any;
      const [{ data: profiles }, { data: plans }, { data: ev }, { data: pend }] = await Promise.all([
        db.from("profiles").select("plan, plan_status, subscription_type"),
        db.from("plans").select("slug, name, monthly_price, yearly_price"),
        db.from("webhook_events").select("event_id, event_type, email, amount, currency, status, error, created_at").order("created_at", { ascending: false }).limit(100),
        db.from("pending_purchases").select("id, email, event, billing, created_at").is("resolved_at", null).order("created_at", { ascending: false }),
      ]);
      const pro = plans?.find(isProPlan);
      const m = Number(pro?.monthly_price ?? 0), y = Number(pro?.yearly_price ?? 0);
      const paying = (profiles ?? []).filter((p: any) => p.plan === "pro");
      const mrr = paying.reduce((sum: number, p: any) => sum + (p.subscription_type === "yearly" ? y / 12 : m), 0);
      const list: WebhookEvent[] = ev ?? [];
      setEvents(list);
      setPending(pend ?? []);
      setData({
        mrr, arr: mrr * 12, active: paying.length,
        problems: list.filter((e) => /refund|dispute|chargeback/.test(e.event_type) || e.status === "error").length,
      });
    })();
  }, []);

  const cards = [
    { label: "MRR (est.)", value: `$${data.mrr.toFixed(0)}`, icon: DollarSign },
    { label: "ARR (est.)", value: `$${data.arr.toFixed(0)}`, icon: Repeat },
    { label: "Active Pro", value: data.active, icon: Users },
    { label: "Refunds / disputes / errors", value: data.problems, icon: AlertCircle },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Revenue & Billing</h1>
        <p className="text-sm text-muted-foreground">Live payment events received from Whop.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="bg-card/40 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{c.label}</span><c.icon className="h-4 w-4 text-primary" /></div>
              <div className="text-2xl font-bold mt-1">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pending.length > 0 && (
        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardHeader><CardTitle className="text-base">Unmatched purchases ({pending.length})</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-muted-foreground">Paid, but no account with this email yet. Pro activates automatically when they sign up with it.</p>
            {pending.map((p) => (
              <div key={p.id} className="flex justify-between gap-2 border-b border-border/40 py-1">
                <span className="truncate">{p.email}</span>
                <span className="text-muted-foreground shrink-0">{p.billing ?? "—"} · {new Date(p.created_at).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardHeader><CardTitle className="text-base">Payment events</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment events received yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr><th className="py-2 pr-3">Date</th><th className="pr-3">Event</th><th className="pr-3">Email</th><th className="pr-3">Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.event_id} className="border-t border-border/40">
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                    <td className="pr-3">{e.event_type}</td>
                    <td className="pr-3 truncate max-w-[200px]">{e.email ?? "—"}</td>
                    <td className="pr-3">{e.amount != null ? `${e.amount} ${e.currency ?? ""}` : "—"}</td>
                    <td><Badge variant={e.status === "processed" ? "default" : e.status === "error" ? "destructive" : "secondary"} title={e.error ?? undefined}>{e.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
