import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard, LineChart, PlusCircle, BarChart3, Brain, Target, FileText, Settings, Bot, Crown, Users,
} from 'lucide-react';
import journexLogo from "@/assets/journex_logo.png";
import { usePlan } from '@/hooks/usePlan';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Trades', url: '/dashboard/trades', icon: LineChart },
  { title: 'Add Trade', url: '/dashboard/add-trade', icon: PlusCircle },
  { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
  { title: 'AI Insights', url: '/dashboard/insights', icon: Brain },
  { title: 'AI Trainer', url: '/dashboard/ai-trainer', icon: Bot },
  { title: 'Strategies', url: '/dashboard/strategies', icon: Target },
  { title: 'Reports', url: '/dashboard/reports', icon: FileText },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  { title: 'Affiliate', url: '/affiliate/dashboard', icon: Users },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { isPro } = usePlan();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <img src={journexLogo} alt="Journex Ai" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg">Journex Ai</span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== '/dashboard' && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {isPro ? (
          <div className="glass-card p-3 text-center border-primary/30">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Crown className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold text-primary">Pro Plan</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Unlimited Trades</p>
          </div>
        ) : (
          <div className="glass-card p-3 text-center space-y-2">
            <p className="text-xs text-muted-foreground">Free Plan</p>
            <NavLink to="/dashboard/upgrade">
              <Button size="sm" className="w-full h-8 text-xs neon-glow">
                <Crown className="w-3 h-3 mr-1" />
                Upgrade to Pro
              </Button>
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
