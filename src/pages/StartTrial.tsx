import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info, Sparkles, Crown, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getReferralCode, clearReferral } from '@/lib/referral';
import journexLogo from '@/assets/journex_logo.png';
import Seo from '@/components/Seo';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Pakistan',
  'United Arab Emirates', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands',
  'Singapore', 'Japan', 'Brazil', 'Mexico', 'South Africa', 'Nigeria', 'Other',
];

const TRIAL_BENEFITS = [
  'Unlimited trades',
  'AI Insights & Mistake Finder',
  'AI Trading Coach',
  'Strategy performance tracking',
  'Full Analytics & Reports',
];

const StartTrial = () => {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [experience, setExperience] = useState('beginner');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !phone || !country) {
      toast.error('Please fill all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Pre-check: prevent multiple trials per email
    const { data: existing } = await supabase
      .from('trial_history')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      setLoading(false);
      toast.error('A free trial has already been used for this email.');
      return;
    }

    const ref_code = getReferralCode();
    const { error } = await signUp(email, password, {
      full_name: fullName,
      experience_level: experience,
      market_type: 'crypto',
      phone,
      country,
      start_trial: 'true',
      ...(ref_code ? { ref_code } : {}),
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    clearReferral();
    toast.success('🎉 Your 3-day Pro trial has started!');
    navigate('/dashboard');
  };

  if (user) {
    // logged-in user reaching this page should go to upgrade page instead
    navigate('/dashboard/upgrade', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background trading-grid p-4 py-10 flex items-center justify-center">
      <Seo
        title="Start your 3-day Pro trial — Journex Ai"
        description="Try Journex Ai Pro free for 3 days: unlimited trades, AI insights, mistake finder, and the full trading coach."
        path="/start-trial"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid md:grid-cols-2 gap-6"
      >
        {/* Left — benefits */}
        <div className="glass-card p-8 hidden md:flex flex-col justify-between bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/30">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src={journexLogo} alt="Journex Ai" className="w-10 h-10 rounded-xl" />
              <span className="text-xl font-bold">Journex Ai</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary mb-4">
              <Crown className="w-3.5 h-3.5" />
              3-Day Pro Trial
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-3">
              Try every Pro feature, free for 3 days
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              No payment required to start. Experience the full power of JournexAI Pro
              and decide if it's right for you.
            </p>
            <ul className="space-y-2.5">
              {TRIAL_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-muted-foreground border-t border-border/50 pt-4 mt-6">
            Trusted by traders managing journals across crypto, forex & futures.
          </div>
        </div>

        {/* Right — form */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-1">Start your free trial</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Tell us a bit about you — takes less than a minute.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Trader" required maxLength={100} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} placeholder="you@example.com" required maxLength={255} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required className="pr-10" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" required maxLength={30} />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Trading Experience <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trial info notice */}
            <div className="relative rounded-xl border border-primary/30 bg-primary/5 p-3.5 flex items-start gap-3 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_70%)] pointer-events-none" />
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 relative">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed relative">
                You will get a <span className="font-semibold text-primary">3-day free trial of JournexAI Pro</span>.
                After the trial ends, a payment link will be sent to your email to continue your Pro membership.
              </p>
            </div>

            <Button type="submit" className="w-full neon-glow" disabled={loading}>
              {loading ? 'Starting your trial…' : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Start 3-Day Free Trial
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground">
              By continuing, you agree to our Terms & Privacy Policy.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StartTrial;
