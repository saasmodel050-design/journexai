import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Target, Trophy, Brain } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import LockedFeature from '@/components/dashboard/LockedFeature';
import PlanBadge from '@/components/dashboard/PlanBadge';
import { usePlan } from '@/hooks/usePlan';

const DashboardOverview = () => {
  const { trades, isLoading } = useTrades();
  const { isPro } = usePlan();

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === 'win').length;
  const losses = trades.filter(t => t.result === 'loss').length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0';
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgRR = totalTrades > 0
    ? trades.filter(t => t.target_price && t.stop_loss && t.entry_price)
      .reduce((sum, t) => {
        const reward = Math.abs((t.target_price! - t.entry_price));
        const risk = Math.abs((t.entry_price - t.stop_loss!));
        return risk > 0 ? sum + (reward / risk) : sum;
      }, 0) / Math.max(trades.filter(t => t.target_price && t.stop_loss).length, 1)
    : 0;

  const stats = [
    { label: 'Total Trades', value: totalTrades, icon: BarChart3, color: 'text-primary' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: 'text-neon-green' },
    { label: 'Total P&L', value: `$${totalPnl.toFixed(2)}`, icon: totalPnl >= 0 ? TrendingUp : TrendingDown, color: totalPnl >= 0 ? 'text-neon-green' : 'text-neon-red' },
    { label: 'Avg Risk:Reward', value: `1:${avgRR.toFixed(1)}`, icon: Trophy, color: 'text-neon-purple' },
  ];

  // Build cumulative PnL chart data
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

  // AI Insights (static patterns based on data)
  const insights = generateInsights(trades);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <PlanBadge />
          </div>
          <p className="text-muted-foreground text-sm">Your trading performance overview</p>
        </div>
      </div>

      <UpgradeBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
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

      {totalTrades === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Start logging your trades to see analytics and AI insights.</p>
          <a href="/dashboard/add-trade" className="text-primary hover:underline text-sm">+ Add your first trade</a>
        </motion.div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Profit Curve</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={pnlCurve}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(190, 95%, 45%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(190, 95%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} />
                  <Tooltip contentStyle={{ background: 'hsl(220, 20%, 9%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="pnl" stroke="hsl(190, 95%, 45%)" fill="url(#pnlGrad)" strokeWidth={2} />
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

          {/* AI Insights — Pro only */}
          {isPro ? (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-neon-purple" />
                <h3 className="text-sm font-semibold">AI Mistake Finder</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="p-4 rounded-xl bg-secondary/50 border border-border"
                  >
                    <div className={`text-xs font-medium mb-2 ${insight.type === 'warning' ? 'text-neon-red' : insight.type === 'success' ? 'text-neon-green' : 'text-neon-blue'}`}>
                      {insight.type === 'warning' ? '⚠️ Pattern Detected' : insight.type === 'success' ? '✅ Strength Found' : '💡 Insight'}
                    </div>
                    <p className="text-sm text-foreground/80">{insight.message}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <LockedFeature message="Upgrade to Pro to unlock AI Mistake Finder">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-neon-purple" />
                  <h3 className="text-sm font-semibold">AI Mistake Finder</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border h-[110px]">
                      <div className="text-xs font-medium mb-2 text-neon-purple">🔒 Pro Insight</div>
                      <p className="text-sm text-foreground/80">Advanced behavioral pattern detected across your recent trades.</p>
                    </div>
                  ))}
                </div>
              </div>
            </LockedFeature>
          )}
        </>
      )}
    </div>
  );
};

function generateInsights(trades: any[]) {
  if (trades.length === 0) return [{ type: 'info', message: 'Add trades to start getting AI-powered insights.' }];

  const insights: { type: string; message: string }[] = [];
  const fomoTrades = trades.filter(t => t.emotion === 'fomo');
  const fomoLosses = fomoTrades.filter(t => t.result === 'loss');
  if (fomoTrades.length >= 2) {
    const fomoLossRate = ((fomoLosses.length / fomoTrades.length) * 100).toFixed(0);
    insights.push({ type: 'warning', message: `You lose ${fomoLossRate}% of trades when trading with FOMO.` });
  }

  const sessions = ['asia', 'london', 'new_york'];
  const sessionStats = sessions.map(s => {
    const st = trades.filter(t => t.trading_session === s);
    const wins = st.filter(t => t.result === 'win').length;
    return { session: s, total: st.length, winRate: st.length > 0 ? wins / st.length : 0 };
  }).filter(s => s.total >= 2);
  if (sessionStats.length > 0) {
    const best = sessionStats.reduce((a, b) => a.winRate > b.winRate ? a : b);
    insights.push({ type: 'success', message: `You perform best during ${best.session.replace('_', ' ')} session (${(best.winRate * 100).toFixed(0)}% win rate).` });
  }

  // Consecutive losses pattern
  let maxConsecLoss = 0, curr = 0;
  for (const t of trades.slice().reverse()) {
    if (t.result === 'loss') { curr++; maxConsecLoss = Math.max(maxConsecLoss, curr); }
    else curr = 0;
  }
  if (maxConsecLoss >= 2) {
    insights.push({ type: 'warning', message: `You tend to keep trading after ${maxConsecLoss} consecutive losses. Consider stepping away.` });
  }

  if (insights.length === 0) {
    insights.push({ type: 'info', message: 'Keep logging trades — more data means better insights.' });
  }
  return insights.slice(0, 3);
}

export default DashboardOverview;
