import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan, useTradeUsage } from '@/hooks/usePlan';
import { useState } from 'react';

const UpgradeBanner = () => {
  const { isFree, isLoading } = usePlan();
  const { todayCount, monthCount, dailyLimit, monthlyLimit } = useTradeUsage();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !isFree || dismissed) return null;

  const monthPct = Math.min((monthCount / monthlyLimit) * 100, 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-4 sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">
              Unlock AI insights, reports, and unlimited trades with Pro
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span>Trades today: <span className="font-mono text-foreground">{todayCount}/{dailyLimit}</span></span>
              <span>This month: <span className="font-mono text-foreground">{monthCount}/{monthlyLimit}</span></span>
            </div>
            <div className="mt-2 h-1.5 w-full sm:w-64 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${monthPct}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" className="neon-glow">
            <Link to="/dashboard/upgrade">
              Upgrade to Pro <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/60"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeBanner;
