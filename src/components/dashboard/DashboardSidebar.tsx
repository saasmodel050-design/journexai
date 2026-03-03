import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard, LineChart, PlusCircle, BarChart3, Brain, Target, FileText, Settings,
} from 'lucide-react';
import journexLogo from "@/assets/journex_logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Trades', url: '/dashboard/trades', icon: LineChart },
  { title: 'Add Trade', url: '/dashboard/add-trade', icon: PlusCircle },
  { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
  { title: 'AI Insights', url: '/dashboard/insights', icon: Brain },
  { title: 'Strategies', url: '/dashboard/strategies', icon: Target },
  { title: 'Reports', url: '/dashboard/reports', icon: FileText },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

const DashboardSidebar = () => {
  const location = useLocation();

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
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Pro Plan</p>
          <p className="text-xs text-primary font-medium">Unlimited Trades</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
