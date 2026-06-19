import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, FileText, Bot, ToggleLeft,
  Bell, LifeBuoy, ScrollText, Receipt, Database, Archive, Shield, Share2, Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/plans", label: "Plans & Pricing", icon: CreditCard },
  { to: "/admin/trials", label: "Pro Trials", icon: CreditCard },
  { to: "/admin/payments", label: "Crypto Payments", icon: Wallet },
  { to: "/admin/affiliates", label: "Affiliates", icon: Share2 },
  { to: "/admin/content", label: "Content (CMS)", icon: FileText },
  { to: "/admin/ai", label: "AI Trainer", icon: Bot },
  { to: "/admin/flags", label: "Feature Toggles", icon: ToggleLeft },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/tickets", label: "Support Tickets", icon: LifeBuoy },
  { to: "/admin/billing", label: "Billing", icon: Receipt },
  { to: "/admin/database", label: "Database", icon: Database },
  { to: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/backups", label: "Backups", icon: Archive },
];

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/40 backdrop-blur-xl">
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold">Journex Admin</div>
          <div className="text-xs text-muted-foreground">Super Control Panel</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end as any}
            className={({ isActive }) => cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              isActive ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}>
            <it.icon className="h-4 w-4" />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
