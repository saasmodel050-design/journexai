import { Link } from 'react-router-dom';
import { Crown, Check, Lock, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
}

const PRO_BENEFITS = [
  'Unlimited trades — no daily or monthly cap',
  'AI Insights & Mistake Finder',
  'AI Trading Coach (chat)',
  'Strategy performance tracking',
  'Full Analytics & Reports',
  'Priority support',
];

const ProUpgradeModal = ({ open, onOpenChange, title, message }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30">
        <div className="relative bg-gradient-to-br from-primary/15 via-accent/10 to-background p-6">
          <div className="absolute top-3 right-3">
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 neon-glow">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {title ?? 'Upgrade to Pro to unlock this feature'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {message ?? "You've hit a Free plan limit. Pro removes all restrictions."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 space-y-4">
          <ul className="space-y-2">
            {PRO_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1 neon-glow" onClick={() => onOpenChange(false)}>
              <Link to="/dashboard/upgrade">
                <Crown className="w-4 h-4 mr-1.5" />
                Upgrade to Pro
              </Link>
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProUpgradeModal;
