import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const DemoTopbar = () => {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted-foreground hidden md:block">
            Trading Journal
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider">
            Demo
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-xs">
          <LogIn className="w-3.5 h-3.5 mr-1.5" />
          Login
        </Button>
        <Button size="sm" onClick={() => navigate('/signup')} className="text-xs">
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Sign Up Free
        </Button>
      </div>
    </header>
  );
};

export default DemoTopbar;
