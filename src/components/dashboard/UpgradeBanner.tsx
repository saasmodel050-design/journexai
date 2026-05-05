import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan, FREE_TRADE_LIMIT } from '@/hooks/usePlan';
import { useTrades } from '@/hooks/useTrades';
import { useState } from 'react';

const UpgradeBanner = () => {
  const { isFree, isLoading } = usePlan();
  const { trades } = useTrades();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !isFree || dismissed) return null;

  const used = trades.length;
  const pct = Math.min((used / FREE_TRADE_LIMIT) * 100, 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-4 sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">You're on the Free plan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {used} / {FREE_TRADE_LIMIT} trades used · Upgrade to Pro for unlimited trades & full AI insights.
            </p>
            <div className="mt-2 h-1.5 w-full sm:w-64 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${pct}%` }} />
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
