import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Repeat, AlertCircle } from "lucide-react";

export default function AdminBilling() {
  const [data, setData] = useState({ mrr: 0, arr: 0, active: 0, churn: 0 });

  useEffect(() => {
    (async () => {
      const { data: profiles } = await (supabase as any).from("profiles").select("plan, plan_status");
      const { data: plans } = await (supabase as any).from("plans").select("slug, monthly_price");
      const proPrice = plans?.find((p: any) => p.slug === "pro")?.monthly_price ?? 0;
      const pro = profiles?.filter((p: any) => p.plan === "pro" && p.plan_status === "active").length ?? 0;
      const mrr = pro * Number(proPrice);
      setData({ mrr, arr: mrr * 12, active: pro, churn: 0 });
    })();
  }, []);

  const cards = [
    { label: "MRR", value: `$${data.mrr.toFixed(0)}`, icon: DollarSign },
    { label: "ARR", value: `$${data.arr.toFixed(0)}`, icon: Repeat },
    { label: "Active Subscriptions", value: data.active, icon: Users },
    { label: "Failed Payments", value: 0, icon: AlertCircle },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Revenue & Billing</h1>
        <p className="text-sm text-muted-foreground">Connect a payment provider to enable refunds, exports, and full subscription control.</p>
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
      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardHeader><CardTitle className="text-base">Payment Provider</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Stripe / Paddle integration is not connected yet. Once connected, payments, refunds and exports will appear here.
        </CardContent>
      </Card>
    </div>
  );
}
