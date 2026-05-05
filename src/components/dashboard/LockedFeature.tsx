import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  message?: string;
}

const LockedFeature = ({ children, message = 'Upgrade to Pro to unlock' }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to="/dashboard/upgrade" className="relative block group">
          <div className="pointer-events-none select-none blur-sm opacity-60 group-hover:opacity-50 transition">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-primary/40 backdrop-blur-sm text-xs font-medium text-primary shadow-lg">
              <Lock className="w-3.5 h-3.5" />
              {message}
            </div>
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  );
};

export default LockedFeature;
