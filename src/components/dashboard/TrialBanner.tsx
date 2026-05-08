import { Link } from 'react-router-dom';
import { Crown, Clock, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';

const TRIAL_PERKS = ['AI Insights', 'AI Trainer', 'Unlimited trades', 'Reports', 'Strategies'];

const TrialBanner = () => {
  const { isLoading, trialActive, trialExpired, daysLeft, hoursLeft, plan } = usePlan();
  if (isLoading) return null;

  if (trialActive) {
    const label =
      daysLeft > 1
        ? `${daysLeft} days remaining in your Pro trial`
        : hoursLeft > 1
        ? `${hoursLeft} hours remaining in your Pro trial`
        : 'Less than an hour left in your Pro trial';

    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 neon-glow">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  🚀 Your Pro Trial is Active
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/60 border border-border text-[11px] font-mono">
                  <Clock className="w-3 h-3" />
                  {label}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                {TRIAL_PERKS.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" /> {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0 neon-glow">
            <Link to="/dashboard/upgrade">
              Upgrade to Pro <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (trialExpired && plan !== 'pro') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-destructive/40 bg-gradient-to-r from-destructive/10 via-background to-destructive/5 p-4 sm:p-5">
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">Your Pro trial has ended</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upgrade to continue using premium AI features and unlimited trades.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link to="/dashboard/upgrade">
              Continue Pro Membership <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default TrialBanner;
