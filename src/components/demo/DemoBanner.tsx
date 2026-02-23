import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DemoBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-neon-purple/10 border border-primary/20 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">Unlock full analytics with an account</p>
          <p className="text-xs text-muted-foreground hidden sm:block">Save trades, get AI insights, and track your performance over time.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={() => navigate('/signup')} className="text-xs h-8">
          Start Tracking Trades
        </Button>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default DemoBanner;
