import { Check, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLivePlans } from '@/hooks/useSiteContent';
import { startProCheckout } from '@/lib/checkout';

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
  const { plan, isPro } = usePlan();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const livePlans = useLivePlans();
  const proPlan = livePlans.find((p: any) => p.slug === 'pro' || p.slug === 'plan-pro' || p.name?.toLowerCase() === 'pro');
  const monthlyPrice = Number(proPlan?.monthly_price ?? 39);
  const yearlyPrice = Number(proPlan?.yearly_price ?? Math.round(monthlyPrice * 12 * 0.65));
  const proPrice = billing === 'yearly' ? yearlyPrice : monthlyPrice;
  const proLiveFeatures: string[] = Array.isArray(proPlan?.features) && proPlan.features.length ? proPlan.features : proFeatures;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Upgrade your plan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Unlock unlimited trades and full AI coaching. Current plan:{' '}
          <span className="text-primary font-semibold capitalize">{plan}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-full border border-border/60 bg-card/40 backdrop-blur">
          {(['monthly', 'yearly'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billing === b ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {b === 'monthly' ? 'Monthly' : 'Yearly'}
              {b === 'yearly' && <span className="ml-2 text-xs opacity-80">Save 35%</span>}
            </button>
          ))}
        </div>
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
          {isPro ? (
            <>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://whop.com/@me/orders" target="_blank" rel="noopener noreferrer">
                  Manage subscription
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                Cancel or change your plan in your Whop account. Your Pro access stays active until the end of your paid period.
              </p>
            </>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Current plan
            </Button>
          )}
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
          <p className="text-3xl font-bold">${proPrice}<span className="text-sm font-normal text-muted-foreground">{billing === 'yearly' ? '/year' : '/month'}</span></p>
          {billing === 'yearly' && (
            <p className="text-xs text-primary">≈ ${Math.round(yearlyPrice / 12)}/mo · billed yearly</p>
          )}
          <ul className="space-y-2">
            {proLiveFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            className="w-full neon-glow"
            disabled={isPro}
            onClick={() => startProCheckout(billing, (p) => navigate(p))}
          >
            {isPro ? 'You are Pro 👑' : 'Buy Pro Plan'}
          </Button>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Secure crypto checkout · USDT, BTC, ETH supported.
      </p>
    </div>
  );
};

export default UpgradePage;
