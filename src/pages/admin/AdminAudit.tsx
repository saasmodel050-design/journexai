import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
      setLogs(data ?? []);
    })();
  }, []);

  const filtered = logs.filter((l) => !q || JSON.stringify(l).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <Input placeholder="Search action, entity..." value={q} onChange={(e) => setQ(e.target.value)} />
      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>When</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Before</TableHead><TableHead>After</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-medium">{l.action}</TableCell>
                  <TableCell className="text-xs">{l.entity}<div className="text-muted-foreground">{l.entity_id?.slice(0, 8)}</div></TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{l.before ? JSON.stringify(l.before) : "—"}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{l.after ? JSON.stringify(l.after) : "—"}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No logs</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
