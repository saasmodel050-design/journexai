import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/hooks/useAdminRole";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";

export default function AdminPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);

  const load = async () => {
    const { data } = await (supabase as any).from("plans").select("*").order("sort_order");
    setPlans(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = (i: number, patch: any) => setPlans(p => p.map((pl, idx) => idx === i ? { ...pl, ...patch } : pl));

  const save = async (p: any) => {
    const { id, ...rest } = p;
    rest.features = typeof rest.features === "string" ? rest.features.split("\n").filter(Boolean) : rest.features;
    const { error } = await (supabase as any).from("plans").update(rest).eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit(user!.id, "update_plan", "plans", id, null, rest);
    toast.success(`Saved ${p.name}`);
    load();
  };

  const addPlan = async () => {
    const { error } = await (supabase as any).from("plans").insert({
      slug: `plan_${Date.now()}`, name: "New Plan", monthly_price: 0, yearly_price: 0, sort_order: plans.length + 1
    });
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (p: any) => {
    if (!confirm(`Delete plan ${p.name}?`)) return;
    const { error } = await (supabase as any).from("plans").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    await logAudit(user!.id, "delete_plan", "plans", p.id, p, null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plans & Pricing</h1>
          <p className="text-sm text-muted-foreground">Changes apply live across the site</p>
        </div>
        <Button onClick={addPlan}><Plus className="h-4 w-4 mr-1" /> Add Plan</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((p, i) => (
          <Card key={p.id} className="bg-card/40 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{p.name} <span className="text-xs text-muted-foreground">({p.slug})</span></CardTitle>
              <Button size="icon" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Name</Label><Input value={p.name} onChange={(e) => update(i, { name: e.target.value })} /></div>
                <div><Label className="text-xs">Slug</Label><Input value={p.slug} onChange={(e) => update(i, { slug: e.target.value })} /></div>
                <div><Label className="text-xs">Monthly $</Label><Input type="number" value={p.monthly_price} onChange={(e) => update(i, { monthly_price: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">Yearly $</Label><Input type="number" value={p.yearly_price} onChange={(e) => update(i, { yearly_price: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">Daily trade limit (blank = unlimited)</Label><Input type="number" value={p.daily_trade_limit ?? ""} onChange={(e) => update(i, { daily_trade_limit: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label className="text-xs">Monthly trade limit</Label><Input type="number" value={p.monthly_trade_limit ?? ""} onChange={(e) => update(i, { monthly_trade_limit: e.target.value ? Number(e.target.value) : null })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["ai_trainer_enabled", "AI Trainer"],
                  ["reports_enabled", "Reports"],
                  ["strategies_enabled", "Strategies"],
                  ["insights_enabled", "Insights"],
                  ["active", "Active"],
                ].map(([k, label]) => (
                  <div key={k} className="flex items-center justify-between rounded-md border border-border/50 p-2">
                    <span>{label}</span>
                    <Switch checked={!!p[k as string]} onCheckedChange={(v) => update(i, { [k as string]: v })} />
                  </div>
                ))}
              </div>
              <div>
                <Label className="text-xs">Features (one per line)</Label>
                <Textarea rows={4} value={Array.isArray(p.features) ? p.features.join("\n") : p.features} onChange={(e) => update(i, { features: e.target.value })} />
              </div>
              <Button onClick={() => save(p)} className="w-full"><Save className="h-4 w-4 mr-1" /> Save Plan</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
