import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Trash2 } from "lucide-react";

export default function AdminNotifications() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ title: "", body: "", type: "announcement", display: "banner", active: true });

  const load = async () => {
    const { data } = await (supabase as any).from("platform_notifications").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!form.title) return toast.error("Title required");
    const { error } = await (supabase as any).from("platform_notifications").insert({ ...form, created_by: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Notification published");
    setForm({ title: "", body: "", type: "announcement", display: "banner", active: true });
    load();
  };

  const toggle = async (n: any, active: boolean) => {
    await (supabase as any).from("platform_notifications").update({ active }).eq("id", n.id);
    load();
  };
  const remove = async (n: any) => {
    if (!confirm("Delete?")) return;
    await (supabase as any).from("platform_notifications").delete().eq("id", n.id);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardHeader><CardTitle className="text-base">Send Platform Notification</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label className="text-xs">Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Display</Label>
              <Select value={form.display} onValueChange={(v) => setForm({ ...form, display: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Dashboard Banner</SelectItem>
                  <SelectItem value="popup">Popup</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={send}>Publish</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {list.map((n) => (
          <Card key={n.id} className="bg-card/40 backdrop-blur border-border/50">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{n.title} <span className="text-xs text-muted-foreground">· {n.type} · {n.display}</span></div>
                <div className="text-xs text-muted-foreground">{n.body}</div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={n.active} onCheckedChange={(v) => toggle(n, v)} />
                <Button size="icon" variant="ghost" onClick={() => remove(n)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
