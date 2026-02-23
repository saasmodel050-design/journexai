import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DemoAddTrade = ({ openModal }: { openModal: (msg?: string) => void }) => {
  const [form, setForm] = useState({
    pair: '', trade_type: 'buy', entry_price: '', target_price: '', stop_loss: '',
    position_size: '', risk_percent: '', trade_time: new Date().toISOString().slice(0, 16),
    trading_session: '', strategy: '', emotion: '', result: '', pnl: '', notes: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openModal('Create your account to save trades and start building your trading journal.');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Trade</h1>
        <p className="text-muted-foreground text-sm">Log a new trade entry</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card p-6 space-y-5"
      >
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
            <Input type="datetime-local" value={form.trade_time} onChange={(e) => update('trade_time', e.target.value)} className="bg-secondary/50 border-border" />
          </div>
        </div>

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

        <div className="space-y-2">
          <Label>Trade Notes</Label>
          <Textarea placeholder="Why did you take this trade?" value={form.notes} onChange={(e) => update('notes', e.target.value)} className="bg-secondary/50 border-border min-h-[80px]" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">
            Save Trade
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default DemoAddTrade;
