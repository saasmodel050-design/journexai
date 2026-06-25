import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const [{ data: a }, { data: p }] = await Promise.all([
      (supabase as any).from("affiliates").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("payouts").select("*, affiliates(full_name, email, paypal_email)").order("requested_at", { ascending: false }),
    ]);
    setAffiliates(a ?? []);
    setPayouts(p ?? []);
  };
  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin_affiliates_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "affiliates" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "payouts" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "referrals" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const setStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "active") patch.approved_at = new Date().toISOString();
    const { error } = await (supabase as any).from("affiliates").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Affiliate ${status}`);
    load();
  };

  const setRate = async (id: string, rate: number) => {
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      return toast.error("Rate must be between 0 and 100");
    }
    const { data, error } = await (supabase as any)
      .from("affiliates")
      .update({ commission_rate: rate })
      .eq("id", id)
      .select("id, commission_rate");
    if (error) return toast.error(error.message);
    if (!data || data.length === 0) {
      return toast.error("Update blocked — you must be signed in as a Super Admin.");
    }
    if (Number(data[0].commission_rate) !== rate) {
      return toast.error("Update was reverted by server policy.");
    }
    toast.success(`Commission rate set to ${rate}%`);
    load();
  };

  const setPayoutStatus = async (p: any, status: "approved" | "paid" | "rejected") => {
    const patch: any = { status, processed_at: new Date().toISOString() };
    const { error } = await (supabase as any).from("payouts").update(patch).eq("id", p.id);
    if (error) return toast.error(error.message);

    if (status === "paid") {
      // shift earnings buckets
      const { data: aff } = await (supabase as any).from("affiliates").select("pending_earnings, paid_earnings").eq("id", p.affiliate_id).single();
      if (aff) {
        const newPending = Math.max(0, Number(aff.pending_earnings) - Number(p.amount));
        const newPaid = Number(aff.paid_earnings) + Number(p.amount);
        await (supabase as any).from("affiliates").update({ pending_earnings: newPending, paid_earnings: newPaid }).eq("id", p.affiliate_id);
      }
    }
    toast.success(`Payout ${status}`);
    load();
  };

  const filtered = affiliates.filter(a =>
    !search || a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.referral_code?.toLowerCase().includes(search.toLowerCase()));

  const top = [...affiliates].sort((a, b) => Number(b.total_earnings) - Number(a.total_earnings)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Affiliate Management</h1>
        <p className="text-sm text-muted-foreground">Approve affiliates, set rates, manage payouts.</p>
      </div>

      <Tabs defaultValue="affiliates">
        <TabsList>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="top">Top Earners</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates" className="space-y-3">
          <Input placeholder="Search by name, email, or code" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <Card className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Refs</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.full_name}</TableCell>
                    <TableCell className="text-xs">{a.email}</TableCell>
                    <TableCell className="font-mono text-xs">{a.referral_code}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{a.status}</Badge></TableCell>
                    <TableCell>
                      <Input
                        key={`${a.id}-${a.commission_rate}`}
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={a.commission_rate}
                        className="w-20 h-8"
                        onBlur={(e) => { const v = Number(e.target.value); if (v !== Number(a.commission_rate)) setRate(a.id, v); }}
                      />
                    </TableCell>
                    <TableCell>{a.total_referrals}</TableCell>
                    <TableCell>{a.total_conversions}</TableCell>
                    <TableCell className="text-primary">${Number(a.total_earnings).toFixed(2)}</TableCell>
                    <TableCell className="flex gap-1">
                      {a.status !== "active" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "active")}>Approve</Button>}
                      {a.status !== "banned" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "banned")}>Ban</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.requested_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs">{p.affiliates?.full_name} <br /><span className="text-muted-foreground">{p.affiliates?.email}</span></TableCell>
                    <TableCell>${Number(p.amount).toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{p.method}</TableCell>
                    <TableCell className="text-xs">{p.destination?.paypal_email ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.status}</Badge></TableCell>
                    <TableCell className="flex gap-1">
                      {p.status === "pending" && <Button size="sm" variant="outline" onClick={() => setPayoutStatus(p, "approved")}>Approve</Button>}
                      {p.status !== "paid" && <Button size="sm" onClick={() => setPayoutStatus(p, "paid")}>Mark Paid</Button>}
                      {p.status === "pending" && <Button size="sm" variant="ghost" onClick={() => setPayoutStatus(p, "rejected")}>Reject</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top.map((a, i) => (
                  <TableRow key={a.id}>
                    <TableCell>#{i + 1}</TableCell>
                    <TableCell>{a.full_name} <br /><span className="text-xs text-muted-foreground">{a.email}</span></TableCell>
                    <TableCell>{a.total_referrals}</TableCell>
                    <TableCell>{a.total_conversions}</TableCell>
                    <TableCell className="text-primary">${Number(a.total_earnings).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
