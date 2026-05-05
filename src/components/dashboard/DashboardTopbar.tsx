import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, LogOut, User, Crown } from 'lucide-react';
import PlanBadge from './PlanBadge';
import { usePlan } from '@/hooks/usePlan';
import { Link } from 'react-router-dom';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardTopbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h2 className="text-sm font-medium text-muted-foreground hidden md:block">
          Trading Journal
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <PlanBadge />
        {!usePlan().isPro && (
          <Button asChild size="sm" variant="outline" className="h-8 border-primary/40 text-primary hover:bg-primary/10">
            <Link to="/dashboard/upgrade">
              <Crown className="w-3.5 h-3.5 mr-1" />
              Upgrade
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardTopbar;
