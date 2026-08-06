import { useEffect, useState } from 'react';
import { Trade } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const num = (v: string) => (v === '' ? null : Number(v));

interface Props {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: Partial<Trade> & { id: string }) => void;
  isSaving?: boolean;
}

const EditTradeDialog = ({ trade, open, onOpenChange, onSave, isSaving }: Props) => {
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!trade) return;
    setForm({
      pair: trade.pair ?? '',
      trade_type: trade.trade_type ?? 'buy',
      entry_price: String(trade.entry_price ?? ''),
      target_price: trade.target_price != null ? String(trade.target_price) : '',
      stop_loss: trade.stop_loss != null ? String(trade.stop_loss) : '',
      position_size: trade.position_size != null ? String(trade.position_size) : '',
      risk_percent: trade.risk_percent != null ? String(trade.risk_percent) : '',
      trade_time: trade.trade_time ? toLocalInput(trade.trade_time) : '',
      trading_session: trade.trading_session ?? 'none',
      strategy: trade.strategy ?? '',
      emotion: trade.emotion ?? 'none',
      result: trade.result ?? 'none',
      pnl: trade.pnl != null ? String(trade.pnl) : '',
      notes: trade.notes ?? '',
    });
  }, [trade]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!trade) return;
    onSave({
      id: trade.id,
      pair: form.pair.trim().toUpperCase(),
      trade_type: form.trade_type as Trade['trade_type'],
      entry_price: Number(form.entry_price),
      target_price: num(form.target_price),
      stop_loss: num(form.stop_loss),
      position_size: num(form.position_size),
      risk_percent: num(form.risk_percent),
      trade_time: form.trade_time ? new Date(form.trade_time).toISOString() : trade.trade_time,
      trading_session: (form.trading_session === 'none' ? null : form.trading_session) as Trade['trading_session'],
      strategy: form.strategy.trim() || null,
      emotion: (form.emotion === 'none' ? null : form.emotion) as Trade['emotion'],
      result: (form.result === 'none' ? null : form.result) as Trade['result'],
      pnl: form.pnl === '' ? 0 : Number(form.pnl),
      notes: form.notes.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>Update the details of this trade and save your changes.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-pair">Pair</Label>
            <Input id="edit-pair" value={form.pair ?? ''} onChange={(e) => set('pair', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-type">Type</Label>
            <Select value={form.trade_type} onValueChange={(v) => set('trade_type', v)}>
              <SelectTrigger id="edit-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-entry">Entry Price</Label>
            <Input id="edit-entry" type="number" step="any" value={form.entry_price ?? ''} onChange={(e) => set('entry_price', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-target">Target Price</Label>
            <Input id="edit-target" type="number" step="any" value={form.target_price ?? ''} onChange={(e) => set('target_price', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-sl">Stop Loss</Label>
            <Input id="edit-sl" type="number" step="any" value={form.stop_loss ?? ''} onChange={(e) => set('stop_loss', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-size">Position Size</Label>
            <Input id="edit-size" type="number" step="any" value={form.position_size ?? ''} onChange={(e) => set('position_size', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-risk">Risk %</Label>
            <Input id="edit-risk" type="number" step="any" value={form.risk_percent ?? ''} onChange={(e) => set('risk_percent', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-time">Date & Time</Label>
            <Input id="edit-time" type="datetime-local" value={form.trade_time ?? ''} onChange={(e) => set('trade_time', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-session">Session</Label>
            <Select value={form.trading_session} onValueChange={(v) => set('trading_session', v)}>
              <SelectTrigger id="edit-session"><SelectValue placeholder="Session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
                <SelectItem value="london">London</SelectItem>
                <SelectItem value="new_york">New York</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-strategy">Strategy</Label>
            <Input id="edit-strategy" value={form.strategy ?? ''} onChange={(e) => set('strategy', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-emotion">Emotion</Label>
            <Select value={form.emotion} onValueChange={(v) => set('emotion', v)}>
              <SelectTrigger id="edit-emotion"><SelectValue placeholder="Emotion" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="confident">Confident</SelectItem>
                <SelectItem value="fomo">FOMO</SelectItem>
                <SelectItem value="fear">Fear</SelectItem>
                <SelectItem value="revenge">Revenge</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-result">Result</Label>
            <Select value={form.result} onValueChange={(v) => set('result', v)}>
              <SelectTrigger id="edit-result"><SelectValue placeholder="Result" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Open / None</SelectItem>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
                <SelectItem value="breakeven">Breakeven</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-pnl">P&amp;L</Label>
            <Input id="edit-pnl" type="number" step="any" value={form.pnl ?? ''} onChange={(e) => set('pnl', e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" rows={3} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !form.pair || form.entry_price === ''}>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTradeDialog;
