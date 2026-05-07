import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { LogOut, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminTopbar() {
  const { user, signOut } = useAuth();
  const { isSuperAdmin } = useAdminRole();
  const navigate = useNavigate();
  return (
    <header className="h-14 border-b border-border/50 bg-card/40 backdrop-blur-xl flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
          {isSuperAdmin ? "Super Admin" : "Support Admin"}
        </span>
        <span className="text-sm text-muted-foreground hidden md:inline">{user?.email}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ExternalLink className="h-4 w-4 mr-1" /> User Dashboard
        </Button>
        <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/login"); }}>
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </div>
    </header>
  );
}
