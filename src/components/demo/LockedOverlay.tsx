import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LockedOverlayProps {
  onClick: () => void;
  label?: string;
}

const LockedOverlay = ({ onClick, label = 'Unlock with a free account' }: LockedOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer rounded-2xl"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md rounded-2xl" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse-glow">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-primary hover:underline">Sign up to unlock →</span>
      </div>
    </motion.div>
  );
};

export default LockedOverlay;
