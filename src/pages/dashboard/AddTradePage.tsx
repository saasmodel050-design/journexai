import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTrades } from '@/hooks/useTrades';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlan, useTradeUsage } from '@/hooks/usePlan';
import { Crown, Lock, CalendarIcon, AlertTriangle, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import ProUpgradeModal from '@/components/dashboard/ProUpgradeModal';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const NONE = '__none__';
const MAX_RISK_PERCENT = 100;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const toLocalInput = (d: Date) => {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
};

/** Suggest a session from the trade's UTC hour. Overlaps resolve to the later (more active) session. */
const suggestSession = (localValue: string): 'asia' | 'london' | 'new_york' | '' => {
  if (!localValue) return '';
  const d = new Date(localValue);
  if (isNaN(d.getTime())) return '';
  const h = d.getUTCHours();
  if (h >= 13 && h < 22) return 'new_york';
  if (h >= 7 && h < 13) return 'london';
  return 'asia';
};

const emptyForm = () => {
  const trade_time = toLocalInput(new Date());
  return {
    pair: '',
    trade_type: 'buy' as 'buy' | 'sell',
    entry_price: '',
    target_price: '',
    stop_loss: '',
    position_size: '',
    risk_percent: '',
    trade_time,
    trading_session: suggestSession(trade_time) as string,
    strategy: '',
    emotion: '' as string,
    result: '' as string,
    pnl: '',
    notes: '',
  };
};

type FormState = ReturnType<typeof emptyForm>;
type Errors = Partial<Record<keyof FormState, string>>;

const parseNum = (v: string) => (v.trim() === '' ? null : Number(v));

const AddTradePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addTrade } = useTrades();
  const { isFree } = usePlan();
  const usage = useTradeUsage();
  const reachedDaily = isFree && usage.reachedDaily;
  const reachedMonthly = isFree && usage.reachedMonthly;
  const reachedLimit = reachedDaily || reachedMonthly;
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const limitMessage = reachedMonthly
    ? `Monthly trade limit reached (${usage.monthlyLimit}/month). Upgrade to Pro for unlimited trades.`
    : `Daily trade limit reached. Upgrade to Pro for unlimited trades.`;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [sessionTouched, setSessionTouched] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const addAnother = useRef(false);

  const dirty = useMemo(() => {
    const base = emptyForm();
    const keys: (keyof FormState)[] = ['pair', 'entry_price', 'target_price', 'stop_loss', 'position_size', 'risk_percent', 'strategy', 'emotion', 'result', 'pnl', 'notes'];
    return keys.some(k => form[k] !== base[k]) || !!file;
  }, [form, file]);

  const update = (key: keyof FormState, value: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'trade_time' && !sessionTouched) next.trading_session = suggestSession(value);
      return next;
    });
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Warn before leaving with unsaved data (tab close / reload, and in-app link clicks)
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a');
      if (!a || !a.href || a.target === '_blank') return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname === window.location.pathname) return;
      if (!window.confirm('You have unsaved trade details. Leave this page and discard them?')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  // Non-blocking warnings
  const warnings = useMemo(() => {
    const w: string[] = [];
    const entry = parseNum(form.entry_price);
    const stop = parseNum(form.stop_loss);
    const pnl = parseNum(form.pnl);
    if (entry && stop != null && !isNaN(stop) && !isNaN(entry)) {
      if (form.trade_type === 'buy' && stop > entry) w.push('Stop loss is above entry on a long trade.');
      if (form.trade_type === 'sell' && stop < entry) w.push('Stop loss is below entry on a short trade.');
    }
    if (pnl != null && !isNaN(pnl)) {
      if (form.result === 'win' && pnl < 0) w.push('Result is "Win" but P&L is negative.');
      if (form.result === 'loss' && pnl > 0) w.push('Result is "Loss" but P&L is positive.');
    }
    return w;
  }, [form]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.pair.trim()) e.pair = 'Enter a market or pair.';
    const entry = parseNum(form.entry_price);
    if (entry == null || isNaN(entry)) e.entry_price = 'Enter a valid number.';
    else if (entry <= 0) e.entry_price = 'Entry price must be greater than 0.';
    for (const k of ['target_price', 'stop_loss', 'position_size', 'pnl'] as const) {
      const v = parseNum(form[k]);
      if (v != null && isNaN(v)) e[k] = 'Enter a valid number.';
      else if (v != null && k !== 'pnl' && v < 0) e[k] = 'Cannot be negative.';
    }
    const risk = parseNum(form.risk_percent);
    if (risk != null && (isNaN(risk) || risk < 0 || risk > MAX_RISK_PERCENT)) e.risk_percent = `Risk must be between 0 and ${MAX_RISK_PERCENT}%.`;
    const t = new Date(form.trade_time);
    if (isNaN(t.getTime())) e.trade_time = 'Pick a valid date and time.';
    else if (t.getTime() > Date.now() + 5 * 60000) e.trade_time = 'Trade time cannot be in the future.';
    return e;
  };

  const onPickFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Please choose an image file.'); return; }
    if (f.size > MAX_IMAGE_BYTES) { toast.error('Image must be 5 MB or smaller.'); return; }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const another = addAnother.current;
    addAnother.current = false;
    if (reachedLimit) {
      toast.error(limitMessage);
      setUpgradeOpen(true);
      return;
    }
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    let screenshot_url: string | null = null;
    try {
      if (file && user) {
        setUploading(true);
        const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('trade-screenshots').upload(path, file, { contentType: file.type });
        if (error) throw error;
        screenshot_url = path;
      }
      const n = (v: string) => (v.trim() === '' ? null : Number(v));
      await addTrade.mutateAsync({
        pair: form.pair.trim(),
        trade_type: form.trade_type,
        entry_price: Number(form.entry_price),
        target_price: n(form.target_price),
        stop_loss: n(form.stop_loss),
        position_size: n(form.position_size),
        risk_percent: n(form.risk_percent),
        trade_time: new Date(form.trade_time).toISOString(),
        trading_session: (form.trading_session || null) as any,
        strategy: form.strategy.trim() || null,
        emotion: (form.emotion || null) as any,
        result: (form.result || null) as any,
        pnl: n(form.pnl) ?? 0,
        notes: form.notes.trim() || null,
        screenshot_url,
      });
    } catch (err: any) {
      console.error('Add trade failed', err);
      const msg = String(err?.message || '');
      toast.error(msg.includes('limit') ? msg : "Couldn't save the trade. Your details are still here — please try again.");
      return;
    } finally {
      setUploading(false);
    }

    if (another) {
      setForm(emptyForm());
      setFile(null);
      setErrors({});
      setSessionTouched(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Trade saved. Ready for the next one.');
    } else {
      setFile(null);
      setForm(emptyForm());
      setTimeout(() => navigate('/dashboard/trades'), 0);
    }
  };

  const handleCancel = () => {
    if (dirty && !window.confirm('You have unsaved trade details. Discard them?')) return;
    setForm(emptyForm());
    setFile(null);
    setTimeout(() => navigate('/dashboard/trades'), 0);
  };

  const fieldErr = (k: keyof FormState) =>
    errors[k] ? <p className="text-xs text-destructive">{errors[k]}</p> : null;
  const errCls = (k: keyof FormState) => (errors[k] ? 'border-destructive' : 'border-border');
  const saving = addTrade.isPending || uploading;
  const now = new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Trade</h1>
        <p className="text-muted-foreground text-sm">Log a new trade entry</p>
      </div>

      {isFree && (
        <div className="glass-card p-4 border-border flex flex-wrap items-center gap-3 text-xs">
          <span className="text-muted-foreground">Trades today:</span>
          <span className="font-mono font-medium">{usage.todayCount}/{usage.dailyLimit}</span>
          <span className="text-muted-foreground ml-2">This month:</span>
          <span className="font-mono font-medium">{usage.monthCount}/{usage.monthlyLimit}</span>
          <Button asChild size="sm" variant="outline" className="ml-auto h-7 border-primary/40 text-primary">
            <Link to="/dashboard/upgrade"><Crown className="w-3 h-3 mr-1" /> Upgrade</Link>
          </Button>
        </div>
      )}

      {reachedLimit && (
        <div className="glass-card p-5 border-primary/40 bg-gradient-to-r from-primary/10 to-accent/10 flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">
              {reachedMonthly ? 'Monthly trade limit reached' : 'Daily trade limit reached'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{limitMessage}</p>
          </div>
          <Button size="sm" className="neon-glow" onClick={() => setUpgradeOpen(true)}>
            <Crown className="w-3.5 h-3.5 mr-1" /> Upgrade
          </Button>
        </div>
      )}

      <ProUpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} title={limitMessage} />

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        noValidate
        className="glass-card p-4 sm:p-6 space-y-5"
      >
        {/* Market & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pair">Market / Pair *</Label>
            <Input id="pair" placeholder="BTC/USDT, EUR/USD..." value={form.pair} onChange={(e) => update('pair', e.target.value)} maxLength={30} className={cn('bg-secondary/50 font-mono', errCls('pair'))} />
            {fieldErr('pair')}
          </div>
          <div className="space-y-2">
            <Label>Trade Type *</Label>
            <Select value={form.trade_type} onValueChange={(v) => update('trade_type', v)}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy / Long</SelectItem>
                <SelectItem value="sell">Sell / Short</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry">Entry Price *</Label>
            <Input id="entry" type="number" step="any" min="0" inputMode="decimal" placeholder="0.00" value={form.entry_price} onChange={(e) => update('entry_price', e.target.value)} className={cn('bg-secondary/50 font-mono', errCls('entry_price'))} />
            {fieldErr('entry_price')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target Price</Label>
            <Input id="target" type="number" step="any" min="0" inputMode="decimal" placeholder="0.00" value={form.target_price} onChange={(e) => update('target_price', e.target.value)} className={cn('bg-secondary/50 font-mono', errCls('target_price'))} />
            {fieldErr('target_price')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stop">Stop Loss</Label>
            <Input id="stop" type="number" step="any" min="0" inputMode="decimal" placeholder="0.00" value={form.stop_loss} onChange={(e) => update('stop_loss', e.target.value)} className={cn('bg-secondary/50 font-mono', errCls('stop_loss'))} />
            {fieldErr('stop_loss')}
          </div>
        </div>

        {/* Position & Risk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Position Size</Label>
            <Input id="size" type="number" step="any" min="0" inputMode="decimal" placeholder="1.0" value={form.position_size} onChange={(e) => update('position_size', e.target.value)} className={cn('bg-secondary/50 font-mono', errCls('position_size'))} />
            {fieldErr('position_size')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk">Risk %</Label>
            <Input id="risk" type="number" step="any" min="0" max={MAX_RISK_PERCENT} inputMode="decimal" placeholder="1.0" value={form.risk_percent} onChange={(e) => update('risk_percent', e.target.value)} className={cn('bg-secondary/50 font-mono', errCls('risk_percent'))} />
            {fieldErr('risk_percent')}
          </div>
        </div>

        {/* Date & Time */}
        <div className="space-y-2">
          <Label>Date & Time</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className={cn('flex-1 min-w-0 justify-start text-left font-normal bg-secondary/50', errCls('trade_time'))}>
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {form.trade_time ? format(new Date(form.trade_time), 'PPP') : 'Pick date'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.trade_time ? new Date(form.trade_time) : undefined}
                  disabled={{ after: now }}
                  toDate={now}
                  onSelect={(d) => {
                    if (!d) return;
                    const time = form.trade_time ? form.trade_time.slice(11, 16) : '00:00';
                    const [h, m] = time.split(':').map(Number);
                    const next = new Date(d);
                    next.setHours(h, m, 0, 0);
                    update('trade_time', toLocalInput(next));
                  }}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              aria-label="Trade time"
              value={form.trade_time ? form.trade_time.slice(11, 16) : ''}
              onChange={(e) => {
                const base = form.trade_time ? new Date(form.trade_time) : new Date();
                const [h, m] = e.target.value.split(':').map(Number);
                base.setHours(h || 0, m || 0, 0, 0);
                update('trade_time', toLocalInput(base));
              }}
              className="w-28 sm:w-32 shrink-0 bg-secondary/50 border-border font-mono"
            />
          </div>
          {fieldErr('trade_time')}
        </div>

        {/* Session & Strategy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trading Session</Label>
            <Select
              value={form.trading_session || undefined}
              key={`session-${form.trading_session || 'empty'}`}
              onValueChange={(v) => { setSessionTouched(true); update('trading_session', v === NONE ? '' : v); }}
            >
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
                <SelectItem value="london">London</SelectItem>
                <SelectItem value="new_york">New York</SelectItem>
              </SelectContent>
            </Select>
            {!sessionTouched && form.trading_session && (
              <p className="text-xs text-muted-foreground">Suggested from trade time</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Input id="strategy" placeholder="e.g. Breakout, Scalp..." value={form.strategy} onChange={(e) => update('strategy', e.target.value)} maxLength={100} className="bg-secondary/50 border-border" />
          </div>
        </div>

        {/* Emotion & Result */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Emotion</Label>
            <Select value={form.emotion || undefined} key={`emo-${form.emotion || 'empty'}`} onValueChange={(v) => update('emotion', v === NONE ? '' : v)}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="How did you feel?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                <SelectItem value="confident">😎 Confident</SelectItem>
                <SelectItem value="fomo">🔥 FOMO</SelectItem>
                <SelectItem value="fear">😰 Fear</SelectItem>
                <SelectItem value="revenge">😤 Revenge</SelectItem>
                <SelectItem value="calm">😌 Calm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Result</Label>
            <Select value={form.result || undefined} key={`res-${form.result || 'empty'}`} onValueChange={(v) => update('result', v === NONE ? '' : v)}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Outcome" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                <SelectItem value="win">✅ Win</SelectItem>
                <SelectItem value="loss">❌ Loss</SelectItem>
                <SelectItem value="breakeven">➖ Breakeven</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pnl">P&L ($)</Label>
            <Input id="pnl" type="number" step="any" inputMode="decimal" placeholder="0.00" value={form.pnl} onChange={(e) => update('pnl', e.target.value)} className={cn('bg-secondary/50 font-mono', errCls('pnl'))} />
            {fieldErr('pnl')}
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 space-y-1" role="status">
            {warnings.map(w => (
              <p key={w} className="text-xs flex items-start gap-2 text-foreground">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" /> {w}
              </p>
            ))}
            <p className="text-xs text-muted-foreground pl-5">You can still save if this is intentional.</p>
          </div>
        )}

        {/* Screenshot */}
        <div className="space-y-2">
          <Label>Chart Screenshot</Label>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { onPickFile(e.target.files?.[0]); e.target.value = ''; }} />
          {preview ? (
            <div className="relative rounded-md overflow-hidden border border-border">
              <img src={preview} alt="Chart screenshot preview" className="w-full max-h-64 object-contain bg-secondary/30" />
              <Button type="button" size="icon" variant="secondary" className="absolute top-2 right-2 h-7 w-7" onClick={() => setFile(null)} aria-label="Remove screenshot">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" className="w-full border-dashed bg-secondary/30" onClick={() => fileInput.current?.click()}>
              <ImagePlus className="w-4 h-4 mr-2" /> Attach image (max 5 MB)
            </Button>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Trade Notes</Label>
          <Textarea id="notes" placeholder="Why did you take this trade? What was your reasoning?" value={form.notes} onChange={(e) => update('notes', e.target.value)} maxLength={5000} className="bg-secondary/50 border-border min-h-[80px]" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="submit" className="flex-1" disabled={saving || reachedLimit} onClick={() => { addAnother.current = false; }}>
            {reachedLimit ? '🔒 Upgrade to Save' : saving ? 'Saving...' : 'Save Trade'}
          </Button>
          <Button type="submit" variant="secondary" className="flex-1" disabled={saving || reachedLimit} onClick={() => { addAnother.current = true; }}>
            Save and add another
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddTradePage;
