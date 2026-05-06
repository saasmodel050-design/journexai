import { useTrades } from '@/hooks/useTrades';
import { Target } from 'lucide-react';
import ProFeatureGate from '@/components/dashboard/ProFeatureGate';

const StrategiesPage = () => (
  <ProFeatureGate featureName="Strategies" description="Track performance by strategy">
    <StrategiesContent />
  </ProFeatureGate>
);

const StrategiesContent = () => {
  const { trades } = useTrades();

  const strategyMap = new Map<string, { total: number; wins: number; losses: number; pnl: number }>();
  trades.forEach(t => {
    const s = t.strategy || 'Untagged';
    const cur = strategyMap.get(s) || { total: 0, wins: 0, losses: 0, pnl: 0 };
    cur.total++;
    if (t.result === 'win') cur.wins++;
    if (t.result === 'loss') cur.losses++;
    cur.pnl += t.pnl || 0;
    strategyMap.set(s, cur);
  });

  const strategies = Array.from(strategyMap.entries()).map(([name, d]) => ({
    name, ...d, winRate: d.total > 0 ? ((d.wins / d.total) * 100).toFixed(0) : '0',
  })).sort((a, b) => b.total - a.total);

  if (strategies.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Strategies</h1>
        <div className="glass-card p-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No strategies yet</h3>
          <p className="text-muted-foreground text-sm">Tag your trades with strategies to track performance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Strategies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map(s => (
          <div key={s.name} className="glass-card-hover p-5">
            <h3 className="font-semibold mb-3">{s.name}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Trades</span><p className="font-mono font-medium">{s.total}</p></div>
              <div><span className="text-muted-foreground text-xs">Win Rate</span><p className="font-mono font-medium text-primary">{s.winRate}%</p></div>
              <div><span className="text-muted-foreground text-xs">Wins / Losses</span><p className="font-mono"><span className="text-neon-green">{s.wins}</span> / <span className="text-neon-red">{s.losses}</span></p></div>
              <div><span className="text-muted-foreground text-xs">P&L</span><p className={`font-mono font-medium ${s.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>{s.pnl >= 0 ? '+' : ''}{s.pnl.toFixed(2)}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategiesPage;
