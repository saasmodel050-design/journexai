import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Crown, Loader2, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import { Button } from '@/components/ui/button';
import Seo from '@/components/Seo';

const MAX_MS = 30_000;
const INTERVAL_MS = 3_000;

const CheckoutSuccess = () => {
  const { user, loading } = useAuth();
  const { isPro, refetch } = usePlan();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!user || isPro) return;
    refetch();
    const started = Date.now();
    const id = window.setInterval(() => {
      if (Date.now() - started >= MAX_MS) {
        window.clearInterval(id);
        setTimedOut(true);
        return;
      }
      refetch();
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [user?.id, isPro]);

  if (!loading && !user) return <Navigate to="/login" state={{ from: { pathname: '/checkout/success' } }} replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background trading-grid p-4">
      <Seo title="Payment confirmation — Journex Ai" description="Confirming your Journex Ai Pro payment." path="/checkout/success" />
      <div className="glass-card p-8 w-full max-w-md text-center">
        {isPro ? (
          <>
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Welcome to Pro</h1>
            <p className="text-muted-foreground mb-6">Your payment is confirmed and every Pro feature is now unlocked.</p>
            <Button asChild className="w-full"><Link to="/dashboard">Go to dashboard</Link></Button>
          </>
        ) : timedOut ? (
          <>
            <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your payment is processing</h1>
            <p className="text-muted-foreground mb-6">
              This can take a few minutes. Pro will switch on automatically. If it isn't active in a few minutes, email{' '}
              <a href="mailto:journex.ai.trade@gmail.com" className="text-primary hover:underline">journex.ai.trade@gmail.com</a>.
            </p>
            <Button asChild variant="outline" className="w-full"><Link to="/dashboard">Go to dashboard</Link></Button>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Confirming your payment…</h1>
            <p className="text-muted-foreground">Hang tight, this usually takes a few seconds.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
