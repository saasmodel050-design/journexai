import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Seo from '@/components/Seo';
import journexLogo from '@/assets/journex_logo.png';

const confirmation = "If an account exists for that email, we've sent a reset link";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await resetPassword(normalizedEmail);
    if (error) console.error('Password reset request failed:', error);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background trading-grid p-4">
      <Seo title="Reset your password — Journex Ai" description="Request a secure password reset link for your Journex Ai account." path="/forgot-password" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <img src={journexLogo} alt="Journex Ai" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold">Journex Ai</span>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Reset your password</h1>
          {sent ? (
            <div className="space-y-6 text-center">
              <p className="text-sm text-muted-foreground">{confirmation}</p>
              <Button asChild className="w-full"><Link to="/login">Back to sign in</Link></Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-muted-foreground text-center">Enter your email and we’ll send you a secure reset link.</p>
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
              <Link to="/login" className="block text-center text-sm text-primary hover:underline">Back to sign in</Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}