import { Check, Crown, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const freeFeatures = [
  'Up to 20 trades',
  'Basic statistics',
  'Manual trade logging',
  'Limited AI analysis',
];
const proFeatures = [
  'Unlimited trades',
  'Full AI Trading Coach',
  'Advanced analytics & insights',
  'Strategy performance breakdown',
  'Priority support',
  'Daily AI reports',
];

const UpgradePage = () => {
  const { plan, isPro, refetch } = usePlan();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (target: 'pro' | 'free') => {
    if (!user) return;
    setLoading(true);
    const updates: any =
      target === 'pro'
        ? { plan: 'pro', plan_status: 'active', subscription_type: 'paid', payment_status: 'paid' }
        : { plan: 'free', plan_status: 'active', subscription_type: 'none' };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(target === 'pro' ? '🎉 Welcome to Pro!' : 'Switched to Free');
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['plan'] });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Upgrade your plan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Unlock unlimited trades and full AI coaching. Current plan:{' '}
          <span className="text-primary font-semibold capitalize">{plan}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Free */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-bold">Free</h3>
          </div>
          <p className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/forever</span></p>
          <ul className="space-y-2">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full"
            disabled={!isPro || loading}
            onClick={() => handleUpgrade('free')}
          >
            {!isPro ? 'Current plan' : 'Downgrade'}
          </Button>
        </div>

        {/* Pro */}
        <div className="relative glass-card p-6 space-y-4 border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="absolute -top-3 right-5 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-bold text-primary-foreground">
            RECOMMENDED
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Pro</h3>
          </div>
          <p className="text-3xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <ul className="space-y-2">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            className="w-full neon-glow"
            disabled={isPro || loading}
            onClick={() => handleUpgrade('pro')}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPro ? 'You are Pro 👑' : 'Upgrade to Pro'}
          </Button>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        This is a demo upgrade flow. Payment integration coming soon.
      </p>
    </div>
  );
};

export default UpgradePage;
