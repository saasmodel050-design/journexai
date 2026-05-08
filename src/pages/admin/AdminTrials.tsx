import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Clock, Plus, X, Check, Search } from 'lucide-react';
import { toast } from 'sonner';

type Row = {
  user_id: string;
  full_name: string;
  plan: string;
  plan_status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
};

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : '—');

const AdminTrials = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, plan, plan_status, trial_start_date, trial_end_date')
      .in('plan', ['pro_trial'])
      .order('trial_end_date', { ascending: true });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as Row[]);
  };

  useEffect(() => { load(); }, []);

  const extend = async (userId: string, currentEnd: string | null, days: number) => {
    const base = currentEnd ? new Date(currentEnd) : new Date();
    if (base.getTime() < Date.now()) base.setTime(Date.now());
    base.setDate(base.getDate() + days);
    const { error } = await supabase
      .from('profiles')
      .update({ trial_end_date: base.toISOString(), plan: 'pro_trial', plan_status: 'active' })
      .eq('user_id', userId);
    if (error) return toast.error(error.message);
    toast.success(`Trial extended by ${days} days`);
    load();
  };

  const cancel = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ plan: 'free', plan_status: 'trial_cancelled', trial_end_date: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) return toast.error(error.message);
    toast.success('Trial cancelled');
    load();
  };

  const convert = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ plan: 'pro', plan_status: 'active', subscription_type: 'paid', payment_status: 'paid' })
      .eq('user_id', userId);
    if (error) return toast.error(error.message);
    toast.success('Converted to paid Pro');
    load();
  };

  const filtered = rows.filter(r =>
    !q || r.full_name?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="w-6 h-6 text-primary" /> Pro Trial Users
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage active Pro trials — extend, cancel, or convert to paid.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name…" className="pl-9" />
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
      </div>

      <div className="glass-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trial Start</TableHead>
              <TableHead>Trial End</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No active trials.</TableCell></TableRow>
            ) : filtered.map((r) => {
              const expired = r.trial_end_date && new Date(r.trial_end_date).getTime() < Date.now();
              return (
                <TableRow key={r.user_id}>
                  <TableCell>
                    <div className="font-medium">{r.full_name || '—'}</div>
                    <div className="text-xs text-muted-foreground font-mono">{r.user_id.slice(0, 8)}…</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${expired ? 'bg-destructive/15 border-destructive/30 text-destructive' : 'bg-primary/15 border-primary/30 text-primary'}`}>
                      <Clock className="w-3 h-3" />
                      {expired ? 'Expired' : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{fmt(r.trial_start_date)}</TableCell>
                  <TableCell className="text-xs">{fmt(r.trial_end_date)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => extend(r.user_id, r.trial_end_date, 3)}>
                        <Plus className="w-3.5 h-3.5 mr-1" />+3d
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => extend(r.user_id, r.trial_end_date, 7)}>
                        <Plus className="w-3.5 h-3.5 mr-1" />+7d
                      </Button>
                      <Button size="sm" onClick={() => convert(r.user_id)}>
                        <Check className="w-3.5 h-3.5 mr-1" />Convert
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancel(r.user_id)}>
                        <X className="w-3.5 h-3.5 mr-1" />Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminTrials;
