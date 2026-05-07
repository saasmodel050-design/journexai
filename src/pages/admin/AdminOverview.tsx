import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Activity, Bot, Zap } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

type Stats = {
  totalUsers: number; freeUsers: number; proUsers: number;
  totalTrades: number; tradesToday: number; aiMessages: number;
  mrr: number; conversion: number;
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  const load = async () => {
    const { data: profiles } = await (supabase as any).from("profiles").select("plan, created_at");
    const { data: trades } = await (supabase as any).from("trades").select("created_at");
    const { data: aiLogs } = await (supabase as any).from("ai_logs").select("id");
    const { data: plans } = await (supabase as any).from("plans").select("slug, monthly_price");

    const free = profiles?.filter((p: any) => p.plan === "free").length ?? 0;
    const pro = profiles?.filter((p: any) => p.plan === "pro").length ?? 0;
    const total = profiles?.length ?? 0;
    const proPrice = plans?.find((p: any) => p.slug === "pro")?.monthly_price ?? 0;

    const today = new Date(); today.setHours(0,0,0,0);
    const tradesToday = trades?.filter((t: any) => new Date(t.created_at) >= today).length ?? 0;

    setStats({
      totalUsers: total, freeUsers: free, proUsers: pro,
      totalTrades: trades?.length ?? 0, tradesToday,
      aiMessages: aiLogs?.length ?? 0,
      mrr: pro * Number(proPrice),
      conversion: total ? (pro / total) * 100 : 0,
    });

    // 14-day growth
    const days: any[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const newUsers = profiles?.filter((p: any) => { const c = new Date(p.created_at); return c >= d && c < next; }).length ?? 0;
      const dayTrades = trades?.filter((t: any) => { const c = new Date(t.created_at); return c >= d && c < next; }).length ?? 0;
      days.push({ day: d.toLocaleDateString(undefined,{month:"short",day:"numeric"}), users: newUsers, trades: dayTrades });
    }
    setGrowth(days);
    setActivity(days);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
    { label: "Pro Users", value: stats?.proUsers ?? 0, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Free Users", value: stats?.freeUsers ?? 0, icon: Users, color: "text-purple-400" },
    { label: "MRR", value: `$${(stats?.mrr ?? 0).toFixed(0)}`, icon: DollarSign, color: "text-yellow-400" },
    { label: "Conversion", value: `${(stats?.conversion ?? 0).toFixed(1)}%`, icon: Activity, color: "text-cyan-400" },
    { label: "Total Trades", value: stats?.totalTrades ?? 0, icon: Zap, color: "text-pink-400" },
    { label: "Trades Today", value: stats?.tradesToday ?? 0, icon: Activity, color: "text-orange-400" },
    { label: "AI Messages", value: stats?.aiMessages ?? 0, icon: Bot, color: "text-indigo-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">Live metrics — auto-refresh every 30s</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="bg-card/40 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <div className="text-2xl font-bold mt-1">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardHeader><CardTitle className="text-base">User Growth (14d)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardHeader><CardTitle className="text-base">Daily Trade Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="trades" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
