import { motion } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';

const InsightsPage = () => {
  const { trades } = useTrades();
  const insights = generateDetailedInsights(trades);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground text-sm">AI-powered pattern detection & mistake finder</p>
      </div>

      {trades.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
          <p className="text-muted-foreground text-sm">Add at least 5 trades to start getting AI-powered insights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, i) => {
            const Icon = insight.type === 'warning' ? AlertTriangle : insight.type === 'success' ? CheckCircle : Lightbulb;
            const colors = insight.type === 'warning' ? 'border-neon-red/30 bg-neon-red/5' : insight.type === 'success' ? 'border-neon-green/30 bg-neon-green/5' : 'border-neon-blue/30 bg-neon-blue/5';
            const iconColor = insight.type === 'warning' ? 'text-neon-red' : insight.type === 'success' ? 'text-neon-green' : 'text-neon-blue';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-5 border ${colors}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${iconColor}`} />
                  <div>
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function generateDetailedInsights(trades: any[]) {
  if (trades.length < 2) return [{ type: 'info', title: 'More Data Needed', message: 'Keep logging trades to unlock AI-powered pattern detection.' }];

  const insights: { type: string; title: string; message: string }[] = [];
  const wins = trades.filter(t => t.result === 'win').length;
  const winRate = (wins / trades.length) * 100;

  // FOMO analysis
  const fomoTrades = trades.filter(t => t.emotion === 'fomo');
  if (fomoTrades.length >= 2) {
    const fomoLosses = fomoTrades.filter(t => t.result === 'loss').length;
    const fomoLossRate = ((fomoLosses / fomoTrades.length) * 100).toFixed(0);
    insights.push({ type: 'warning', title: 'FOMO Trading Pattern', message: `You lose ${fomoLossRate}% of trades when trading with FOMO. Consider waiting for confirmation before entering.` });
  }

  // Best session
  const sessions = ['asia', 'london', 'new_york'].map(s => {
    const st = trades.filter(t => t.trading_session === s);
    const w = st.filter(t => t.result === 'win').length;
    return { session: s.replace('_', ' '), total: st.length, winRate: st.length > 0 ? (w / st.length) * 100 : 0 };
  }).filter(s => s.total >= 2);
  if (sessions.length > 0) {
    const best = sessions.reduce((a, b) => a.winRate > b.winRate ? a : b);
    insights.push({ type: 'success', title: 'Best Trading Session', message: `Your win rate is highest during ${best.session} session at ${best.winRate.toFixed(0)}%. Focus your trading here.` });
  }

  // Consecutive losses
  let maxConsec = 0, curr = 0;
  for (const t of trades.slice().reverse()) {
    if (t.result === 'loss') { curr++; maxConsec = Math.max(maxConsec, curr); } else curr = 0;
  }
  if (maxConsec >= 3) {
    insights.push({ type: 'warning', title: 'Consecutive Loss Streak', message: `You had ${maxConsec} consecutive losses. You tend to lose more after 2+ losses in a row. Set a daily loss limit.` });
  }

  // Revenge trading
  const revengeTrades = trades.filter(t => t.emotion === 'revenge');
  if (revengeTrades.length >= 2) {
    const revLosses = revengeTrades.filter(t => t.result === 'loss').length;
    insights.push({ type: 'warning', title: 'Revenge Trading', message: `${revLosses} out of ${revengeTrades.length} revenge trades resulted in losses. Step away after a loss.` });
  }

  // Win rate insight
  if (winRate >= 55) {
    insights.push({ type: 'success', title: 'Strong Win Rate', message: `Your overall win rate is ${winRate.toFixed(0)}%. Keep your current discipline and risk management.` });
  } else if (winRate < 40 && trades.length >= 5) {
    insights.push({ type: 'warning', title: 'Low Win Rate', message: `Your win rate is ${winRate.toFixed(0)}%. Review your entry criteria and consider tightening your strategy.` });
  }

  // Calm trades performance
  const calmTrades = trades.filter(t => t.emotion === 'calm');
  if (calmTrades.length >= 2) {
    const calmWins = calmTrades.filter(t => t.result === 'win').length;
    const calmWR = ((calmWins / calmTrades.length) * 100).toFixed(0);
    insights.push({ type: 'success', title: 'Calm State Performance', message: `When trading calm, your win rate is ${calmWR}%. Meditation and pre-trade routines can help maintain this state.` });
  }

  return insights.length > 0 ? insights : [{ type: 'info', title: 'Building Your Profile', message: 'Keep logging trades with emotions and sessions to get personalized insights.' }];
}

export default InsightsPage;
