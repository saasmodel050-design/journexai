import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { friendlyAuthError } from '@/lib/authErrors';
import journexLogo from "@/assets/journex_logo.png";
import { toast } from 'sonner';
import { getReferralCode, clearReferral } from '@/lib/referral';
import Seo from '@/components/Seo';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { consumePurchaseIntent, savePurchaseIntent, goToWhop, peekPurchaseIntent, type Billing } from '@/lib/checkout';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [marketType, setMarketType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const strength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (!password) return null;
    if (password.length < 8) return { label: 'Too short — use at least 8 characters', cls: 'text-destructive' };
    if (score <= 2) return { label: 'Weak — add numbers, symbols or mixed case', cls: 'text-destructive' };
    if (score === 3) return { label: 'Okay', cls: 'text-muted-foreground' };
    return { label: 'Strong', cls: 'text-primary' };
  })();

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingEmail,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setResending(false);
    if (error) {
      console.error('Resend confirmation error:', error);
      toast.error(friendlyAuthError(error));
    } else {
      toast.success('Confirmation email sent again.');
    }
  };
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Detect purchase intent from query (?plan=pro or ?next=checkout) and persist it.
  useEffect(() => {
    const plan = searchParams.get('plan');
    const next = searchParams.get('next');
    const billing = (searchParams.get('billing') as Billing) || 'monthly';
    if ((plan === 'pro' || next === 'checkout') && !peekPurchaseIntent()) {
      savePurchaseIntent(billing);
    }
  }, [searchParams]);

  // If the user is already signed in, don't force another signup — resume the flow.
  useEffect(() => {
    if (authLoading || !user) return;
    const intent = consumePurchaseIntent();
    if (intent) {
      goToWhop(intent.billing);
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!agreed) {
      toast.error('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const ref_code = getReferralCode();
    const { data, error } = await signUp(cleanEmail, password, {
      full_name: fullName.trim(),
      experience_level: experienceLevel || 'beginner',
      market_type: marketType || 'crypto',
      ...(ref_code ? { ref_code } : {}),
    });
    setLoading(false);
    if (error) {
      console.error('Sign-up error:', error);
      toast.error(friendlyAuthError(error));
      return;
    }
    clearReferral();
    if (data?.session) {
      toast.success('Account created!');
      // Navigation and purchase-intent handling happen in the effect watching `user`.
    } else {
      setPendingEmail(cleanEmail);
    }
  };

  if (pendingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background trading-grid p-4">
        <Seo title="Confirm your email — Journex Ai" description="Check your inbox to confirm your Journex Ai account." path="/signup" />
        <div className="glass-card p-8 w-full max-w-md text-center">
          <MailCheck className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Check your email to confirm your account</h1>
          <p className="text-muted-foreground mb-6">
            We sent a confirmation link to <span className="text-foreground font-medium break-all">{pendingEmail}</span>. Click it to activate your account.
          </p>
          <Button onClick={handleResend} disabled={resending} variant="outline" className="w-full">
            {resending ? 'Sending...' : 'Resend confirmation email'}
          </Button>
          <p className="text-sm text-muted-foreground mt-6">
            Already confirmed? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background trading-grid p-4">
      <Seo
        title="Create your free Journex Ai account"
        description="Sign up free to start journaling trades, tracking emotions, and getting AI insights for crypto, forex, and futures."
        path="/signup"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <img src={journexLogo} alt="Journex Ai" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold">Journex Ai</span>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Create your account</h1>
          <p className="text-muted-foreground text-center mb-6">Start journaling your trades today</p>

          <div className="space-y-4 mb-4">
            <GoogleSignInButton label="Sign up with Google" />
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" className="bg-secondary/50 border-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="trader@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="bg-secondary/50 border-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="bg-secondary/50 border-border pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="bg-secondary/50 border-border pr-10" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {strength && <p className={`text-xs -mt-2 ${strength.cls}`}>{strength.label}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Experience Level <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Select onValueChange={setExperienceLevel}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Market Type <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Select onValueChange={setMarketType}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="futures">Futures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug">
                I agree to the <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !agreed}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>

          <Link to="/" className="block text-center text-xs text-muted-foreground mt-4 hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
