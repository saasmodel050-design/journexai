import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import journexLogo from "@/assets/journex_logo.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("saasmodel050@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, signIn, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();

  // Best-effort: ensure the super admin account exists on first visit.
  useEffect(() => {
    supabase.functions.invoke("seed-admin").catch(() => {});
  }, []);

  if (!authLoading && user && isAdmin && !roleLoading) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Make sure admin account is provisioned before sign-in attempt.
    try {
      await supabase.functions.invoke("seed-admin");
    } catch {
      /* non-fatal */
    }
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome, admin");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background trading-grid p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8 border border-primary/20">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <img src={journexLogo} alt="Journex Ai" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold">Journex Ai</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-center">Admin Sign In</h1>
          </div>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Restricted area. Authorized administrators only.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Admin email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-secondary/50 border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in to Admin"
              )}
            </Button>
          </form>

          <Link to="/login" className="block text-center text-xs text-muted-foreground mt-6 hover:text-foreground">
            ← Back to user login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
