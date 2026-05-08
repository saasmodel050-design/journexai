import { Crown, Sparkles, Clock } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';

const PlanBadge = ({ className }: { className?: string }) => {
  const { plan, trialActive, daysLeft } = usePlan();

  if (trialActive) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
        'bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40 text-primary',
        className
      )}>
        <Clock className="w-3 h-3" />
        Pro Trial · {daysLeft}d
      </span>
    );
  }

  const isPro = plan === 'pro';
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
      isPro
        ? 'bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40 text-primary'
        : 'bg-secondary/60 border-border text-muted-foreground',
      className
    )}>
      {isPro ? <Crown className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
      {isPro ? 'Pro' : 'Free'}
    </span>
  );
};

export default PlanBadge;
