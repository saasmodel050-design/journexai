import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/hooks/useAdminRole";
import { Plus, Save, Send, Trash2 } from "lucide-react";

const DEFAULT_SECTIONS = [
  { page: "home", section_key: "hero", draft: { title: "Master Your Trading Mindset", subtitle: "AI-powered journaling for crypto, forex & futures", cta: "Get Started" } },
  { page: "pricing", section_key: "header", draft: { title: "Simple Pricing", subtitle: "Choose the plan that works for you" } },
  { page: "about", section_key: "main", draft: { title: "About Journex AI", body: "We help traders grow with AI." } },
];

export default function AdminContent() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await (supabase as any).from("site_content").select("*").order("page");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const seedDefaults = async () => {
    for (const s of DEFAULT_SECTIONS) {
      await (supabase as any).from("site_content").insert(s);
    }
    toast.success("Default sections seeded");
    load();
  };

  const update = (i: number, key: string, value: string) => {
    setItems(items.map((it, idx) => idx === i ? { ...it, draft: { ...it.draft, [key]: value } } : it));
  };

  const saveDraft = async (it: any) => {
    const { error } = await (supabase as any).from("site_content").update({ draft: it.draft }).eq("id", it.id);
    if (error) return toast.error(error.message);
    toast.success("Draft saved");
  };

  const publish = async (it: any) => {
    const { error } = await (supabase as any).from("site_content").update({ draft: it.draft, published: it.draft }).eq("id", it.id);
    if (error) return toast.error(error.message);
    await logAudit(user!.id, "publish_content", "site_content", it.id, null, it.draft);
    toast.success("Published live");
    load();
  };

  const addSection = async () => {
    const page = prompt("Page (home, pricing, about, etc.)") || "home";
    const key = prompt("Section key") || "section";
    await (supabase as any).from("site_content").insert({ page, section_key: key, draft: { title: "" } });
    load();
  };

  const remove = async (it: any) => {
    if (!confirm("Delete section?")) return;
    await (supabase as any).from("site_content").delete().eq("id", it.id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website Content (CMS)</h1>
          <p className="text-sm text-muted-foreground">Edit drafts, then Publish to push live</p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 && <Button variant="outline" onClick={seedDefaults}>Seed defaults</Button>}
          <Button onClick={addSection}><Plus className="h-4 w-4 mr-1" /> Add Section</Button>
        </div>
      </div>

      {items.map((it, i) => (
        <Card key={it.id} className="bg-card/40 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base capitalize">{it.page} · {it.section_key}</CardTitle>
            <Button size="icon" variant="ghost" onClick={() => remove(it)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(it.draft || {}).map(([k, v]) => (
              <div key={k}>
                <Label className="text-xs capitalize">{k}</Label>
                {String(v).length > 80
                  ? <Textarea value={String(v)} onChange={(e) => update(i, k, e.target.value)} rows={3} />
                  : <Input value={String(v)} onChange={(e) => update(i, k, e.target.value)} />}
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => saveDraft(it)}><Save className="h-4 w-4 mr-1" /> Save Draft</Button>
              <Button onClick={() => publish(it)}><Send className="h-4 w-4 mr-1" /> Publish Live</Button>
            </div>
            <div className="text-xs text-muted-foreground">Last published: {it.published?.title ? "✓" : "Never"}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
