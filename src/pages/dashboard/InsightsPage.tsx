import ProFeatureGate from '@/components/dashboard/ProFeatureGate';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';

const InsightsPage = () => {
  return (
    <ProFeatureGate
      featureName="AI Insights"
      description="AI-powered pattern detection & mistake finder"
    >
      <InsightsContent />
    </ProFeatureGate>
  );
};

const InsightsContent = () => {
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
  const fomoTrades = trades.filter(t => t.emotion === 'fomo');
  if (fomoTrades.length >= 2) {
    const fomoLosses = fomoTrades.filter(t => t.result === 'loss').length;
    const fomoLossRate = ((fomoLosses / fomoTrades.length) * 100).toFixed(0);
    insights.push({ type: 'warning', title: 'FOMO Trading Pattern', message: `You lose ${fomoLossRate}% of trades when trading with FOMO.` });
  }
  if (winRate >= 55) insights.push({ type: 'success', title: 'Strong Win Rate', message: `Your overall win rate is ${winRate.toFixed(0)}%.` });
  return insights.length > 0 ? insights : [{ type: 'info', title: 'Building Your Profile', message: 'Keep logging trades.' }];
}

export default InsightsPage;
