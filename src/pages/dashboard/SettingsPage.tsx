import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AlertTriangle, Crown, Download, ExternalLink, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import { browserTimezone, listTimezones } from '@/lib/timezone';

const WHOP_MANAGE_URL = 'https://whop.com/@me/orders';

const Section = ({ title, description, children, danger }: { title: string; description?: string; children: React.ReactNode; danger?: boolean }) => (
  <section className={`glass-card p-4 sm:p-6 space-y-5 ${danger ? 'border-destructive/40' : ''}`}>
    <div>
      <h2 className={`text-lg font-semibold ${danger ? 'text-destructive' : ''}`}>{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    {children}
  </section>
);

const csvCell = (v: unknown) => {
  if (v === null || v === undefined) return '';
  let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // prevent spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const download = (content: string, filename: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const SettingsPage = () => {
  const { user, signOut } = useAuth() as any;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { plan, isPro, subscriptionType, proUntil, cancelAtPeriodEnd } = usePlan();

  const [profileState, setProfileState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [fullName, setFullName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [marketType, setMarketType] = useState('crypto');
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const timezones = useMemo(() => listTimezones(), []);
  const detectedTz = browserTimezone();

  const loadProfile = async () => {
    if (!user) return;
    setProfileState('loading');
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
    if (error) { console.error(error); setProfileState('error'); return; }
    if (!data) { setProfileState('missing'); return; }
    const p = data as any;
    setFullName(p.full_name || '');
    setExperienceLevel(p.experience_level || 'beginner');
    setMarketType(p.market_type || 'crypto');
    setTimezone(p.timezone || 'UTC');
    setProfileState('ready');
  };

  useEffect(() => { loadProfile(); }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) { toast.error('Please enter your name.'); return; }
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName.trim().slice(0, 100),
      experience_level: experienceLevel,
      market_type: marketType,
      timezone,
    } as any).eq('user_id', user.id);
    setLoading(false);
    if (error) { console.error(error); toast.error("Couldn't save your profile. Please try again."); return; }
    qc.invalidateQueries({ queryKey: ['plan', user.id] });
    toast.success('Profile updated');
  };

  const handleEmailChange = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) { toast.error('Enter a valid email address.'); return; }
    if (email === user?.email?.toLowerCase()) { toast.error('That is already your email.'); return; }
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: `${window.location.origin}/dashboard/settings` });
    setEmailLoading(false);
    if (error) { console.error(error); toast.error(error.message.includes('registered') ? 'That email is already in use.' : "Couldn't change your email. Please try again."); return; }
    setNewEmail('');
    toast.success('Check your inbox — confirm the change from the link we sent.');
  };

  const handlePasswordChange = async () => {
    if (!user?.email) return;
    if (!currentPw) { toast.error('Enter your current password.'); return; }
    if (newPw.length < 8) { toast.error('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { toast.error('New passwords do not match.'); return; }
    if (newPw === currentPw) { toast.error('New password must be different from the current one.'); return; }
    setPwLoading(true);
    const { error: verifyErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPw });
    if (verifyErr) { setPwLoading(false); toast.error('Current password is incorrect.'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { console.error(error); toast.error(error.message.toLowerCase().includes('weak') || error.message.toLowerCase().includes('pwned') ? 'That password is too weak or has appeared in a data breach. Choose another.' : "Couldn't change your password. Please try again."); return; }
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    toast.success('Password changed');
  };

  const handleExport = async (kind: 'csv' | 'json') => {
    if (!user) return;
    setExporting(kind);
    try {
      const all: any[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase.from('trades').select('*').eq('user_id', user.id)
          .order('trade_time', { ascending: true }).range(from, from + 999);
        if (error) throw error;
        all.push(...(data ?? []));
        if (!data || data.length < 1000) break;
      }
      const stamp = new Date().toISOString().slice(0, 10);
      if (kind === 'json') {
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
        download(JSON.stringify({ exported_at: new Date().toISOString(), email: user.email, profile, trades: all }, null, 2),
          `journex-data-${stamp}.json`, 'application/json');
      } else {
        const cols = all.length ? Object.keys(all[0]) : ['id', 'pair', 'trade_type', 'entry_price', 'trade_time', 'pnl'];
        const csv = [cols.join(','), ...all.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n');
        download(csv, `journex-trades-${stamp}.csv`, 'text/csv;charset=utf-8');
      }
      toast.success(`Exported ${all.length} trade${all.length === 1 ? '' : 's'}`);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't export your data. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const handleDelete = async () => {
    if (deleteText !== 'DELETE') return;
    setDeleting(true);
    const { error } = await supabase.functions.invoke('delete-account', { body: { confirm: 'DELETE' } });
    if (error) {
      console.error(error);
      setDeleting(false);
      toast.error("Couldn't delete your account. Please contact journex.ai.trade@gmail.com.");
      return;
    }
    try { await (signOut ? signOut() : supabase.auth.signOut()); } catch { /* session already gone */ }
    toast.success('Your account and data have been deleted.');
    navigate('/', { replace: true });
  };

  const planLabel = isPro ? 'Pro' : 'Free';
  const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, security, billing and data</p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        {profileState === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading profile…</div>
        )}
        {(profileState === 'error' || profileState === 'missing') && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 space-y-3">
            <p className="text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
              {profileState === 'missing'
                ? 'Your profile could not be found. Please contact journex.ai.trade@gmail.com so we can fix your account.'
                : "We couldn't load your profile. Check your connection and try again."}
            </p>
            <Button size="sm" variant="outline" onClick={loadProfile}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry</Button>
          </div>
        )}
        {profileState === 'ready' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} maxLength={100} autoComplete="name" onChange={(e) => setFullName(e.target.value)} className="bg-secondary/50 border-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Market Type</Label>
                <Select value={marketType} onValueChange={setMarketType}>
                  <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="futures">Futures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used for when your day starts — daily trade limits and day-by-day stats.
                {detectedTz !== timezone && (
                  <> This device is set to {detectedTz.replace(/_/g, ' ')}.{' '}
                    <button type="button" className="text-primary underline" onClick={() => setTimezone(detectedTz)}>Use it</button>
                  </>
                )}
              </p>
            </div>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </>
        )}
      </Section>

      {/* Email */}
      <Section title="Email" description="Your sign-in email. To change it, enter a new address — we'll email a confirmation link and the change only takes effect once you click it.">
        <div className="space-y-2">
          <Label htmlFor="currentEmail">Current email</Label>
          <Input id="currentEmail" value={user?.email || ''} disabled className="bg-secondary/50 border-border opacity-60" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input type="email" placeholder="New email address" autoComplete="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="bg-secondary/50 border-border" />
          <Button variant="outline" onClick={handleEmailChange} disabled={emailLoading || !newEmail.trim()}>
            {emailLoading ? 'Sending...' : 'Change email'}
          </Button>
        </div>
      </Section>

      {/* Password */}
      <Section title="Change password">
        <div className="space-y-2">
          <Label htmlFor="currentPw">Current password</Label>
          <Input id="currentPw" type={showPw ? 'text' : 'password'} autoComplete="current-password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPw">New password</Label>
            <Input id="newPw" type={showPw ? 'text' : 'password'} autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPw">Confirm new password</Label>
            <Input id="confirmPw" type={showPw ? 'text' : 'password'} autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="bg-secondary/50 border-border" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">At least 8 characters. {newPw && newPw.length < 8 && <span className="text-destructive">{8 - newPw.length} more needed.</span>}{confirmPw && newPw !== confirmPw && <span className="text-destructive"> Passwords don't match.</span>}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handlePasswordChange} disabled={pwLoading}>{pwLoading ? 'Updating...' : 'Update password'}</Button>
          <Button type="button" variant="ghost" onClick={() => setShowPw(s => !s)}>
            {showPw ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />} {showPw ? 'Hide' : 'Show'}
          </Button>
        </div>
      </Section>

      {/* Billing */}
      <Section title="Billing">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Current plan:</span>
          <Badge variant={isPro ? 'default' : 'secondary'} className="gap-1">{isPro && <Crown className="w-3 h-3" />}{planLabel}</Badge>
          {isPro && subscriptionType && ['monthly', 'yearly'].includes(subscriptionType) && (
            <span className="text-sm text-muted-foreground capitalize">· {subscriptionType}</span>
          )}
        </div>
        {isPro && proUntil && (
          <p className="text-sm text-muted-foreground">
            {cancelAtPeriodEnd ? `Cancelled — Pro stays active until ${fmtDate(proUntil)}.` : `Current period ends ${fmtDate(proUntil)}.`}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {isPro ? (
            <Button asChild variant="outline">
              <a href={WHOP_MANAGE_URL} target="_blank" rel="noopener noreferrer">Manage subscription <ExternalLink className="w-3.5 h-3.5 ml-1" /></a>
            </Button>
          ) : (
            <Button onClick={() => navigate('/dashboard/upgrade')}><Crown className="w-4 h-4 mr-1" /> Upgrade to Pro</Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Payments, invoices and cancellation are handled by Whop.</p>
      </Section>

      {/* Data export */}
      <Section title="Export my data" description="Download every trade you've logged. JSON also includes your profile.">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={!!exporting}>
            {exporting === 'csv' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />} Trades (CSV)
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')} disabled={!!exporting}>
            {exporting === 'json' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />} All data (JSON)
          </Button>
        </div>
      </Section>

      {/* Delete */}
      <Section danger title="Delete my account" description="Permanently deletes your account, trades, screenshots, support tickets and affiliate data. This cannot be undone.">
        {isPro && !cancelAtPeriodEnd && (
          <p className="text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
            Cancel your subscription on Whop first — deleting your account here does not stop Whop billing.
          </p>
        )}
        <AlertDialog onOpenChange={(o) => { if (!o) setDeleteText(''); }}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                All your trades and data will be erased immediately. Consider exporting first. Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="DELETE" aria-label="Type DELETE to confirm" className="font-mono" />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteText !== 'DELETE' || deleting}
                onClick={(e) => { e.preventDefault(); handleDelete(); }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting...' : 'Delete forever'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>
    </div>
  );
};

export default SettingsPage;
