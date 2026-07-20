import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, LayoutDashboard, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden px-4">
      <Seo title="Page Not Found — Journex AI" description="The page you're looking for doesn't exist." path={location.pathname} />
      <div className="absolute inset-0 trading-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="relative z-10 text-center max-w-md">
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">This trade doesn't exist</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for was moved, deleted, or never existed. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button size="lg" className="neon-glow">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="outline">
              <Play className="w-4 h-4 mr-2" /> Try the Demo
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="ghost">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
