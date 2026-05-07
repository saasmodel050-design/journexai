import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function AdminTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [reply, setReply] = useState("");

  const load = async () => {
    const { data } = await (supabase as any).from("support_tickets").select("*").order("created_at", { ascending: false });
    setTickets(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openTicket = async (id: string) => {
    setOpen(id);
    const { data } = await (supabase as any).from("ticket_replies").select("*").eq("ticket_id", id).order("created_at");
    setReplies(data ?? []);
  };

  const send = async () => {
    if (!reply.trim() || !open) return;
    await (supabase as any).from("ticket_replies").insert({ ticket_id: open, author_id: user!.id, is_admin_reply: true, body: reply });
    setReply("");
    openTicket(open);
    toast.success("Reply sent");
  };

  const setStatus = async (id: string, status: string) => {
    await (supabase as any).from("support_tickets").update({ status }).eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      {tickets.length === 0 && <p className="text-muted-foreground text-sm">No tickets yet.</p>}
      <div className="space-y-2">
        {tickets.map((t) => (
          <Card key={t.id} className="bg-card/40 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.subject}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.status === "open" ? "default" : "secondary"}>{t.status}</Badge>
                  <Select value={t.status} onValueChange={(v) => setStatus(t.id, v)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => openTicket(t.id)}>{open === t.id ? "Hide" : "View"}</Button>
                </div>
              </div>
              <p className="text-sm mt-2 text-muted-foreground">{t.message}</p>

              {open === t.id && (
                <div className="mt-3 border-t border-border/50 pt-3 space-y-2">
                  {replies.map((r) => (
                    <div key={r.id} className={`p-2 rounded-md text-sm ${r.is_admin_reply ? "bg-primary/10" : "bg-muted/30"}`}>
                      <div className="text-xs text-muted-foreground">{r.is_admin_reply ? "Admin" : "User"} · {new Date(r.created_at).toLocaleString()}</div>
                      {r.body}
                    </div>
                  ))}
                  <Textarea placeholder="Reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
                  <Button size="sm" onClick={send}>Send Reply</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
