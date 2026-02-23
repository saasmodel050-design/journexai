import { useTrades } from '@/hooks/useTrades';
import { FileText } from 'lucide-react';

const ReportsPage = () => {
  const { trades } = useTrades();

  // Monthly breakdown
  const monthlyMap = new Map<string, { trades: number; wins: number; pnl: number }>();
  trades.forEach(t => {
    const key = new Date(t.trade_time).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const cur = monthlyMap.get(key) || { trades: 0, wins: 0, pnl: 0 };
    cur.trades++;
    if (t.result === 'win') cur.wins++;
    cur.pnl += t.pnl || 0;
    monthlyMap.set(key, cur);
  });

  const months = Array.from(monthlyMap.entries()).map(([month, d]) => ({
    month, ...d, winRate: d.trades > 0 ? ((d.wins / d.trades) * 100).toFixed(0) : '0',
  }));

  if (months.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
          <p className="text-muted-foreground text-sm">Monthly reports will appear after you start trading.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-xs text-muted-foreground">Month</th>
              <th className="text-right p-4 text-xs text-muted-foreground">Trades</th>
              <th className="text-right p-4 text-xs text-muted-foreground">Win Rate</th>
              <th className="text-right p-4 text-xs text-muted-foreground">P&L</th>
            </tr>
          </thead>
          <tbody>
            {months.map(m => (
              <tr key={m.month} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="p-4 font-medium">{m.month}</td>
                <td className="p-4 text-right font-mono">{m.trades}</td>
                <td className="p-4 text-right font-mono">{m.winRate}%</td>
                <td className={`p-4 text-right font-mono font-medium ${m.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  {m.pnl >= 0 ? '+' : ''}{m.pnl.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
