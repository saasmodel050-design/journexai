import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

const TABLES = ["profiles", "trades", "plans", "feature_flags", "platform_notifications", "ai_logs", "audit_logs"];

export default function AdminDatabase() {
  const [table, setTable] = useState("profiles");
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from(table).select("*").limit(200);
      setRows(data ?? []);
    })();
  }, [table]);

  const filtered = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  const exportCsv = () => {
    if (!filtered.length) return;
    const keys = Object.keys(filtered[0]);
    const csv = [keys.join(","), ...filtered.map(r => keys.map(k => JSON.stringify(r[k] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${table}.csv`; a.click();
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${table}.json`; a.click();
  };

  const headers = filtered[0] ? Object.keys(filtered[0]) : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Database</h1>
      <div className="flex flex-col md:flex-row gap-2">
        <Select value={table} onValueChange={setTable}>
          <SelectTrigger className="md:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>{TABLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Search rows..." value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />CSV</Button>
        <Button variant="outline" onClick={exportJson}><Download className="h-4 w-4 mr-1" />JSON</Button>
      </div>
      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border/50">{headers.map(h => <th key={h} className="text-left p-2 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/30">
                  {headers.map(h => <td key={h} className="p-2 max-w-xs truncate">{typeof r[h] === "object" ? JSON.stringify(r[h]) : String(r[h] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center text-muted-foreground py-8">No rows</div>}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Read-only view. Inline editing & deletes coming next iteration to avoid accidental destructive changes.</p>
    </div>
  );
}
