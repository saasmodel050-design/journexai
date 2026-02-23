import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard, LineChart, PlusCircle, BarChart3, Brain, Target, FileText, TrendingUp, Lock,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';

const freeItems = [
  { title: 'Dashboard', url: '/demo', icon: LayoutDashboard },
  { title: 'Trades', url: '/demo/trades', icon: LineChart },
  { title: 'Add Trade', url: '/demo/add-trade', icon: PlusCircle },
  { title: 'Analytics', url: '/demo/analytics', icon: BarChart3 },
];

const lockedItems = [
  { title: 'AI Insights', icon: Brain },
  { title: 'Strategies', icon: Target },
  { title: 'Reports', icon: FileText },
];

const DemoSidebar = ({ openModal }: { openModal: (msg?: string) => void }) => {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <NavLink to="/demo" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg">TradeMind</span>
        </NavLink>
        <div className="mt-2 px-2 py-1 rounded-md bg-accent/15 border border-accent/20 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">Demo Mode</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {freeItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== '/demo' && location.pathname.startsWith(item.url));
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
              {lockedItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => openModal(`Create your account to unlock ${item.title}.`)}
                    className="opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                    <Lock className="w-3 h-3 ml-auto text-muted-foreground" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Free Demo</p>
          <p className="text-xs text-primary font-medium">Sign up to unlock all features</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DemoSidebar;
