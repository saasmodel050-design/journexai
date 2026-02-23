import { useTrades } from '@/hooks/useTrades';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

const AnalyticsPage = () => {
  const { trades } = useTrades();

  // Emotion breakdown
  const emotions = ['confident', 'fomo', 'fear', 'revenge', 'calm'];
  const emotionData = emotions.map(e => {
    const et = trades.filter(t => t.emotion === e);
    const wins = et.filter(t => t.result === 'win').length;
    return { emotion: e, total: et.length, wins, losses: et.filter(t => t.result === 'loss').length, winRate: et.length > 0 ? ((wins / et.length) * 100).toFixed(0) : '0' };
  }).filter(e => e.total > 0);

  // Session breakdown
  const sessionData = ['asia', 'london', 'new_york'].map(s => {
    const st = trades.filter(t => t.trading_session === s);
    return { session: s.replace('_', ' '), total: st.length, pnl: st.reduce((sum, t) => sum + (t.pnl || 0), 0) };
  }).filter(s => s.total > 0);

  // Strategy breakdown
  const strategyMap = new Map<string, { total: number; wins: number; pnl: number }>();
  trades.forEach(t => {
    const s = t.strategy || 'No Strategy';
    const cur = strategyMap.get(s) || { total: 0, wins: 0, pnl: 0 };
    cur.total++;
    if (t.result === 'win') cur.wins++;
    cur.pnl += t.pnl || 0;
    strategyMap.set(s, cur);
  });
  const strategyData = Array.from(strategyMap.entries()).map(([name, d]) => ({
    name, ...d, winRate: ((d.wins / d.total) * 100).toFixed(0),
  }));

  if (trades.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="glass-card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No data yet</h3>
          <p className="text-muted-foreground text-sm">Add trades to see detailed analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep dive into your trading patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Emotion Performance */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Performance by Emotion</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={emotionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="emotion" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 20%, 9%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="wins" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="losses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Session Performance */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">P&L by Session</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="session" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 20%, 9%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="pnl" fill="hsl(190, 95%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Table */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Strategy Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs text-muted-foreground">Strategy</th>
                <th className="text-right py-2 text-xs text-muted-foreground">Trades</th>
                <th className="text-right py-2 text-xs text-muted-foreground">Win Rate</th>
                <th className="text-right py-2 text-xs text-muted-foreground">P&L</th>
              </tr>
            </thead>
            <tbody>
              {strategyData.map(s => (
                <tr key={s.name} className="border-b border-border/50">
                  <td className="py-2.5 font-medium">{s.name}</td>
                  <td className="py-2.5 text-right font-mono">{s.total}</td>
                  <td className="py-2.5 text-right font-mono">{s.winRate}%</td>
                  <td className={`py-2.5 text-right font-mono font-medium ${s.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {s.pnl >= 0 ? '+' : ''}{s.pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
