import { demoTrades } from '@/data/demoTrades';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LockedOverlay from '@/components/demo/LockedOverlay';

const DemoAnalytics = ({ openModal }: { openModal: (msg?: string) => void }) => {
  const trades = demoTrades;

  const emotions = ['confident', 'fomo', 'fear', 'revenge', 'calm'];
  const emotionData = emotions.map(e => {
    const et = trades.filter(t => t.emotion === e);
    const wins = et.filter(t => t.result === 'win').length;
    return { emotion: e, wins, losses: et.filter(t => t.result === 'loss').length };
  }).filter(e => e.wins + e.losses > 0);

  const sessionData = ['asia', 'london', 'new_york'].map(s => {
    const st = trades.filter(t => t.trading_session === s);
    return { session: s.replace('_', ' '), pnl: st.reduce((sum, t) => sum + (t.pnl || 0), 0) };
  }).filter(s => s.pnl !== 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep dive into your trading patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      {/* Strategy breakdown - locked */}
      <div className="relative glass-card p-5 min-h-[200px]">
        <LockedOverlay onClick={() => openModal('Create your account to unlock advanced strategy analytics.')} label="Unlock Strategy Analytics" />
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
              <tr className="border-b border-border/50">
                <td className="py-2.5 font-medium">Breakout</td>
                <td className="py-2.5 text-right font-mono">4</td>
                <td className="py-2.5 text-right font-mono">75%</td>
                <td className="py-2.5 text-right font-mono text-neon-green">+$1,460</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2.5 font-medium">Trend Follow</td>
                <td className="py-2.5 text-right font-mono">3</td>
                <td className="py-2.5 text-right font-mono">67%</td>
                <td className="py-2.5 text-right font-mono text-neon-green">+$1,350</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2.5 font-medium">Scalp</td>
                <td className="py-2.5 text-right font-mono">2</td>
                <td className="py-2.5 text-right font-mono">0%</td>
                <td className="py-2.5 text-right font-mono text-neon-red">-$330</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DemoAnalytics;
