import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Seo from '@/components/Seo';
import journexLogo from '@/assets/journex_logo.png';
import { toast } from 'sonner';

export default function ResetPassword() {
  const { session, loading: authLoading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters.');
    if (password !== confirmPassword) return toast.error('Passwords do not match.');
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      console.error('Password update failed:', error);
      return toast.error('Something went wrong. Please request a new reset link.');
    }
    toast.success('Password updated. You can now sign in.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background trading-grid p-4">
      <Seo title="Choose a new password — Journex Ai" description="Securely choose a new password for your Journex Ai account." path="/reset-password" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <img src={journexLogo} alt="Journex Ai" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold">Journex Ai</span>
          </div>
          {authLoading ? (
            <p className="text-center text-sm text-muted-foreground">Checking your reset link…</p>
          ) : !session ? (
            <div className="space-y-5 text-center">
              <h1 className="text-2xl font-bold">This reset link is invalid or expired</h1>
              <p className="text-sm text-muted-foreground">Request a new link to continue.</p>
              <Button asChild className="w-full"><Link to="/forgot-password">Request a new reset link</Link></Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Choose a new password</h1>
                <p className="text-sm text-muted-foreground">Use at least 8 characters.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required className="pr-10" />
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide passwords' : 'Show passwords'} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm new password</Label>
                <Input id="confirm-new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}