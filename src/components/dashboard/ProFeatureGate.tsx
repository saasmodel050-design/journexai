import { ReactNode, useState, useEffect } from 'react';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { usePlan } from '@/hooks/usePlan';
import ProUpgradeModal from './ProUpgradeModal';

interface Props {
  featureName: string;
  description?: string;
  children?: ReactNode;
  /** Auto-open the upgrade modal once when a Free user lands on the page. */
  autoPrompt?: boolean;
}

/**
 * Full-page Pro feature gate. Renders a locked card with upgrade CTA
 * when the user is on the Free plan. Pro users see `children`.
 */
const ProFeatureGate = ({ featureName, description, children, autoPrompt = true }: Props) => {
  const { isPro, isLoading } = usePlan();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isPro && autoPrompt) setOpen(true);
  }, [isLoading, isPro, autoPrompt]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isPro) return <>{children}</>;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {featureName}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-semibold text-primary uppercase tracking-wider">
              <Lock className="w-3 h-3" /> Pro
            </span>
          </h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>

        <div className="relative glass-card p-10 sm:p-14 text-center overflow-hidden border-primary/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)] pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4 neon-glow">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Upgrade to Pro to unlock {featureName}</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              This feature is part of the Pro plan. Upgrade to access {featureName.toLowerCase()},
              unlimited trades, AI coaching, and more.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button asChild className="neon-glow">
                <Link to="/dashboard/upgrade">
                  <Crown className="w-4 h-4 mr-1.5" />
                  Upgrade to Pro
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setOpen(true)}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                See Pro benefits
              </Button>
            </div>
          </div>
        </div>

        {/* Blurred preview of underlying content */}
        {children && (
          <div className="relative">
            <div className="pointer-events-none select-none blur-md opacity-40">
              {children}
            </div>
          </div>
        )}
      </div>

      <ProUpgradeModal
        open={open}
        onOpenChange={setOpen}
        title={`Upgrade to Pro to unlock ${featureName}`}
      />
    </>
  );
};

export default ProFeatureGate;
