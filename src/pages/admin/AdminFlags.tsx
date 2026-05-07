import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/hooks/useAdminRole";

export default function AdminFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<any[]>([]);

  const load = async () => {
    const { data } = await (supabase as any).from("feature_flags").select("*").order("label");
    setFlags(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (f: any, enabled: boolean) => {
    const { error } = await (supabase as any).from("feature_flags").update({ enabled }).eq("id", f.id);
    if (error) return toast.error(error.message);
    await logAudit(user!.id, "toggle_flag", "feature_flags", f.id, { enabled: f.enabled }, { enabled });
    toast.success(`${f.label} ${enabled ? "enabled" : "disabled"}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Feature Toggles</h1>
        <p className="text-sm text-muted-foreground">Disable features instantly across the platform</p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {flags.map((f) => (
          <Card key={f.id} className="bg-card/40 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.description}</div>
              </div>
              <Switch checked={f.enabled} onCheckedChange={(v) => toggle(f, v)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
