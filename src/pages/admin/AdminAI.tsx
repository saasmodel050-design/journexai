import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/hooks/useAdminRole";
import { Save } from "lucide-react";

export default function AdminAI() {
  const { user } = useAuth();
  const [s, setS] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    const { data } = await (supabase as any).from("ai_settings").select("*").limit(1).maybeSingle();
    setS(data);
    const { data: l } = await (supabase as any).from("ai_logs").select("*").order("created_at", { ascending: false }).limit(20);
    setLogs(l ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const { id, ...rest } = s;
    const { error } = await (supabase as any).from("ai_settings").update(rest).eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit(user!.id, "update_ai_settings", "ai_settings", id, null, rest);
    toast.success("AI settings saved");
  };

  if (!s) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">AI Trainer Management</h1>
        <p className="text-sm text-muted-foreground">Personality, prompts & limits</p>
      </div>

      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Personality</Label>
              <Select value={s.personality} onValueChange={(v) => setS({ ...s, personality: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional_coach">Professional Coach</SelectItem>
                  <SelectItem value="friendly_mentor">Friendly Mentor</SelectItem>
                  <SelectItem value="strict_analyst">Strict Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Response Depth</Label>
              <Select value={s.response_depth} onValueChange={(v) => setS({ ...s, response_depth: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Daily Message Limit (Free)</Label>
              <Input type="number" value={s.daily_message_limit} onChange={(e) => setS({ ...s, daily_message_limit: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Model</Label>
              <Select value={s.model} onValueChange={(v) => setS({ ...s, model: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
                  <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/50 p-2">
            <span className="text-sm">Allow Free plan access</span>
            <Switch checked={s.free_access} onCheckedChange={(v) => setS({ ...s, free_access: v })} />
          </div>
          <div>
            <Label className="text-xs">System Prompt</Label>
            <Textarea rows={6} value={s.system_prompt} onChange={(e) => setS({ ...s, system_prompt: e.target.value })} />
          </div>
          <Button onClick={save}><Save className="h-4 w-4 mr-1" /> Save Settings</Button>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardHeader><CardTitle className="text-base">Recent AI Activity ({logs.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Prompt</TableHead><TableHead>Tokens</TableHead><TableHead>Error</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{new Date(l.created_at).toLocaleString()}</TableCell>
                  <TableCell className="max-w-md truncate text-xs">{l.prompt}</TableCell>
                  <TableCell>{l.tokens ?? "—"}</TableCell>
                  <TableCell className="text-destructive text-xs">{l.error ?? ""}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No logs yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
