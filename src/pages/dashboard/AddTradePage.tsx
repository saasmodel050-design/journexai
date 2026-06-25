import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTrades } from '@/hooks/useTrades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlan, useTradeUsage } from '@/hooks/usePlan';
import { Crown, Lock, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import ProUpgradeModal from '@/components/dashboard/ProUpgradeModal';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AddTradePage = () => {
  const navigate = useNavigate();
  const { addTrade } = useTrades();
  const toLocalInput = (d: Date) => {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 16);
  };
  const { isFree } = usePlan();
  const usage = useTradeUsage();
  const reachedDaily = isFree && usage.reachedDaily;
  const reachedMonthly = isFree && usage.reachedMonthly;
  const reachedLimit = reachedDaily || reachedMonthly;
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const limitMessage = reachedMonthly
    ? `Monthly trade limit reached (${usage.monthlyLimit}/month). Upgrade to Pro for unlimited trades.`
    : `Daily trade limit reached. Upgrade to Pro for unlimited trades.`;

  const [form, setForm] = useState({
    pair: '',
    trade_type: 'buy' as 'buy' | 'sell',
    entry_price: '',
    target_price: '',
    stop_loss: '',
    position_size: '',
    risk_percent: '',
    trade_time: toLocalInput(new Date()),
    trading_session: '' as string,
    strategy: '',
    emotion: '' as string,
    result: '' as string,
    pnl: '',
    notes: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reachedLimit) {
      toast.error(limitMessage);
      setUpgradeOpen(true);
      return;
    }
    await addTrade.mutateAsync({
      pair: form.pair,
      trade_type: form.trade_type,
      entry_price: parseFloat(form.entry_price),
      target_price: form.target_price ? parseFloat(form.target_price) : null,
      stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
      position_size: form.position_size ? parseFloat(form.position_size) : null,
      risk_percent: form.risk_percent ? parseFloat(form.risk_percent) : null,
      trade_time: new Date(form.trade_time).toISOString(),
      trading_session: (form.trading_session || null) as any,
      strategy: form.strategy || null,
      emotion: (form.emotion || null) as any,
      result: (form.result || null) as any,
      pnl: form.pnl ? parseFloat(form.pnl) : 0,
      notes: form.notes || null,
      screenshot_url: null,
    });
    navigate('/dashboard/trades');
  };

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
        className="glass-card p-6 space-y-5"
      >
        {/* Market & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Market / Pair *</Label>
            <Input placeholder="BTC/USDT, EUR/USD..." value={form.pair} onChange={(e) => update('pair', e.target.value)} required className="bg-secondary/50 border-border font-mono" />
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
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Entry Price *</Label>
            <Input type="number" step="any" placeholder="0.00" value={form.entry_price} onChange={(e) => update('entry_price', e.target.value)} required className="bg-secondary/50 border-border font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Target Price</Label>
            <Input type="number" step="any" placeholder="0.00" value={form.target_price} onChange={(e) => update('target_price', e.target.value)} className="bg-secondary/50 border-border font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Stop Loss</Label>
            <Input type="number" step="any" placeholder="0.00" value={form.stop_loss} onChange={(e) => update('stop_loss', e.target.value)} className="bg-secondary/50 border-border font-mono" />
          </div>
        </div>

        {/* Position & Risk */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Position Size</Label>
            <Input type="number" step="any" placeholder="1.0" value={form.position_size} onChange={(e) => update('position_size', e.target.value)} className="bg-secondary/50 border-border font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Risk %</Label>
            <Input type="number" step="any" placeholder="1.0" value={form.risk_percent} onChange={(e) => update('risk_percent', e.target.value)} className="bg-secondary/50 border-border font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal bg-secondary/50 border-border",
                      !form.trade_time && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.trade_time ? format(new Date(form.trade_time), "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.trade_time ? new Date(form.trade_time) : undefined}
                    onSelect={(d) => {
                      if (!d) return;
                      const time = form.trade_time ? form.trade_time.slice(11, 16) : '00:00';
                      const [h, m] = time.split(':').map(Number);
                      const next = new Date(d);
                      next.setHours(h, m, 0, 0);
                      update('trade_time', toLocalInput(next));
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={form.trade_time ? form.trade_time.slice(11, 16) : ''}
                onChange={(e) => {
                  const base = form.trade_time ? new Date(form.trade_time) : new Date();
                  const [h, m] = e.target.value.split(':').map(Number);
                  base.setHours(h || 0, m || 0, 0, 0);
                  update('trade_time', toLocalInput(base));
                }}
                className="w-28 bg-secondary/50 border-border font-mono"
              />
            </div>
          </div>
        </div>

        {/* Session & Strategy */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trading Session</Label>
            <Select value={form.trading_session} onValueChange={(v) => update('trading_session', v)}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asia">Asia</SelectItem>
                <SelectItem value="london">London</SelectItem>
                <SelectItem value="new_york">New York</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Strategy</Label>
            <Input placeholder="e.g. Breakout, Scalp..." value={form.strategy} onChange={(e) => update('strategy', e.target.value)} className="bg-secondary/50 border-border" />
          </div>
        </div>

        {/* Emotion & Result */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Emotion</Label>
            <Select value={form.emotion} onValueChange={(v) => update('emotion', v)}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="How did you feel?" /></SelectTrigger>
              <SelectContent>
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
            <Select value={form.result} onValueChange={(v) => update('result', v)}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Outcome" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="win">✅ Win</SelectItem>
                <SelectItem value="loss">❌ Loss</SelectItem>
                <SelectItem value="breakeven">➖ Breakeven</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>P&L ($)</Label>
            <Input type="number" step="any" placeholder="0.00" value={form.pnl} onChange={(e) => update('pnl', e.target.value)} className="bg-secondary/50 border-border font-mono" />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Trade Notes</Label>
          <Textarea placeholder="Why did you take this trade? What was your reasoning?" value={form.notes} onChange={(e) => update('notes', e.target.value)} className="bg-secondary/50 border-border min-h-[80px]" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1" disabled={addTrade.isPending || reachedLimit}>
            {reachedLimit ? '🔒 Upgrade to Save' : addTrade.isPending ? 'Saving...' : 'Save Trade'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/trades')}>
            Cancel
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddTradePage;
