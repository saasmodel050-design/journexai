import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Target, Trophy, Brain, Lock } from 'lucide-react';
import { demoTrades } from '@/data/demoTrades';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LockedOverlay from '@/components/demo/LockedOverlay';

const DemoDashboard = ({ openModal }: { openModal: (msg?: string) => void }) => {
  const trades = demoTrades;
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === 'win').length;
  const losses = trades.filter(t => t.result === 'loss').length;
  const winRate = ((wins / totalTrades) * 100).toFixed(1);
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgRR = trades.filter(t => t.target_price && t.stop_loss && t.entry_price)
    .reduce((sum, t) => {
      const reward = Math.abs((t.target_price! - t.entry_price));
      const risk = Math.abs((t.entry_price - t.stop_loss!));
      return risk > 0 ? sum + (reward / risk) : sum;
    }, 0) / Math.max(trades.filter(t => t.target_price && t.stop_loss).length, 1);

  const bestDay = Math.max(...trades.map(t => t.pnl));
  const worstDay = Math.min(...trades.map(t => t.pnl));

  const stats = [
    { label: 'Total Trades', value: totalTrades, icon: BarChart3, color: 'text-primary' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: 'text-neon-green' },
    { label: 'Total P&L', value: `$${totalPnl.toFixed(2)}`, icon: totalPnl >= 0 ? TrendingUp : TrendingDown, color: totalPnl >= 0 ? 'text-neon-green' : 'text-neon-red' },
    { label: 'Avg Risk:Reward', value: `1:${avgRR.toFixed(1)}`, icon: Trophy, color: 'text-neon-purple' },
    { label: 'Best Trade', value: `+$${bestDay.toFixed(2)}`, icon: TrendingUp, color: 'text-neon-green' },
    { label: 'Worst Trade', value: `$${worstDay.toFixed(2)}`, icon: TrendingDown, color: 'text-neon-red' },
  ];

  const pnlCurve = trades.slice().reverse().reduce((acc: { date: string; pnl: number }[], trade, i) => {
    const prev = i > 0 ? acc[i - 1].pnl : 0;
    acc.push({ date: new Date(trade.trade_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), pnl: prev + (trade.pnl || 0) });
    return acc;
  }, []);

  const pieData = [
    { name: 'Wins', value: wins, color: 'hsl(160, 84%, 39%)' },
    { name: 'Losses', value: losses, color: 'hsl(0, 72%, 51%)' },
    { name: 'Breakeven', value: totalTrades - wins - losses, color: 'hsl(220, 15%, 55%)' },
  ].filter(d => d.value > 0);

  // Monthly performance
  const monthlyMap = new Map<string, number>();
  trades.forEach(t => {
    const key = new Date(t.trade_time).toLocaleDateString('en-US', { month: 'short' });
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + t.pnl);
  });
  const monthlyData = Array.from(monthlyMap.entries()).map(([month, pnl]) => ({ month, pnl }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your trading performance overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Profit Curve</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={pnlCurve}>
              <defs>
                <linearGradient id="demoPnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(190, 95%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(190, 95%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 20%, 9%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="pnl" stroke="hsl(190, 95%, 45%)" fill="url(#demoPnlGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Win / Loss</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(220, 20%, 9%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights - Locked */}
      <div className="relative glass-card p-5">
        <LockedOverlay onClick={() => openModal('Create your account to unlock AI-powered mistake detection and insights.')} label="Unlock AI Insights" />
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-neon-purple" />
          <h3 className="text-sm font-semibold">AI Mistake Finder</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="text-xs font-medium mb-2 text-neon-red">⚠️ Pattern Detected</div>
            <p className="text-sm text-foreground/80">You lose 67% of trades when trading with FOMO.</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="text-xs font-medium mb-2 text-neon-green">✅ Strength Found</div>
            <p className="text-sm text-foreground/80">You perform best during London session (80% win rate).</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="text-xs font-medium mb-2 text-neon-red">⚠️ Pattern Detected</div>
            <p className="text-sm text-foreground/80">Revenge trades have a 100% loss rate. Step away after losses.</p>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Monthly Performance</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
            <Tooltip contentStyle={{ background: 'hsl(220, 20%, 9%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="pnl" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DemoDashboard;
