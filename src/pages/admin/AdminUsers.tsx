import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/hooks/useAdminRole";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const load = async () => {
    const { data: profiles } = await (supabase as any).from("profiles").select("*").order("created_at", { ascending: false });
    const { data: trades } = await (supabase as any).from("trades").select("user_id");
    const counts: Record<string, number> = {};
    trades?.forEach((t: any) => { counts[t.user_id] = (counts[t.user_id] ?? 0) + 1; });
    setUsers((profiles ?? []).map((p: any) => ({ ...p, trade_count: counts[p.user_id] ?? 0 })));
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    if (planFilter !== "all" && u.plan !== planFilter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return u.full_name?.toLowerCase().includes(s) || u.user_id?.toLowerCase().includes(s);
  });

  const updatePlan = async (u: any, plan: string) => {
    const before = { plan: u.plan };
    const { error } = await (supabase as any).from("profiles").update({ plan }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    await logAudit(user!.id, "update_user_plan", "profiles", u.user_id, before, { plan });
    toast.success(`Plan updated to ${plan}`);
    load();
  };

  const updateStatus = async (u: any, plan_status: string) => {
    const { error } = await (supabase as any).from("profiles").update({ plan_status }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    await logAudit(user!.id, "update_user_status", "profiles", u.user_id, { plan_status: u.plan_status }, { plan_status });
    toast.success("Status updated");
    load();
  };

  const deleteUser = async (u: any) => {
    if (!confirm(`Delete profile of ${u.full_name}? (Auth user must be removed manually)`)) return;
    const { error } = await (supabase as any).from("profiles").delete().eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    await logAudit(user!.id, "delete_profile", "profiles", u.user_id, u, null);
    toast.success("Profile deleted");
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">{users.length} total users</p>
      </div>

      <Card className="bg-card/40 backdrop-blur border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name or id" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trades</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.experience_level} · {u.market_type}</div>
                    </TableCell>
                    <TableCell>
                      <Select value={u.plan} onValueChange={(v) => updatePlan(u, v)}>
                        <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={u.plan_status} onValueChange={(v) => updateStatus(u, v)}>
                        <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{u.trade_count}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => deleteUser(u)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
