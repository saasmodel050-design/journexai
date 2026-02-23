import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingCTA = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/signup')}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-lg neon-glow hover:shadow-[0_0_30px_-3px_hsl(var(--primary)/0.5)] transition-shadow"
    >
      <TrendingUp className="w-4 h-4" />
      Start Tracking Trades
    </motion.button>
  );
};

export default FloatingCTA;
