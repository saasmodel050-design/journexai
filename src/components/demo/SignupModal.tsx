import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const SignupModal = ({ open, onClose, message }: SignupModalProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative glass-card p-8 max-w-md w-full text-center neon-glow"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-primary" />
            </div>

            <h3 className="text-xl font-bold mb-2">
              {message || 'Create your account to start tracking trades and get AI insights.'}
            </h3>

            <p className="text-muted-foreground text-sm mb-6">
              Join thousands of traders improving their performance with Journex Ai.
            </p>

            <div className="space-y-3">
              <Button
                className="w-full h-11 text-sm font-semibold"
                onClick={() => navigate('/signup')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Sign Up Free
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 text-sm"
                onClick={() => navigate('/login')}
              >
                Already have an account? Login
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Your trading improvement starts here.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupModal;
