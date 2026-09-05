import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense, useEffect } from "react";
import { captureReferralFromUrl } from "@/lib/referral";
import CustomCursor from "@/components/CustomCursor";
import { supabase } from "@/integrations/supabase/client";

// Eager: public landing + auth (small, needed immediately)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Lazy: everything else
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Affiliate = lazy(() => import("./pages/Affiliate"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));

const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const DashboardOverview = lazy(() => import("./pages/dashboard/DashboardOverview"));
const TradesPage = lazy(() => import("./pages/dashboard/TradesPage"));
const AddTradePage = lazy(() => import("./pages/dashboard/AddTradePage"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const InsightsPage = lazy(() => import("./pages/dashboard/InsightsPage"));
const StrategiesPage = lazy(() => import("./pages/dashboard/StrategiesPage"));
const ReportsPage = lazy(() => import("./pages/dashboard/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const AITrainerPage = lazy(() => import("./pages/dashboard/AITrainerPage"));
const UpgradePage = lazy(() => import("./pages/dashboard/UpgradePage"));

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPlans = lazy(() => import("./pages/admin/AdminPlans"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminAI = lazy(() => import("./pages/admin/AdminAI"));
const AdminFlags = lazy(() => import("./pages/admin/AdminFlags"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling"));
const AdminDatabase = lazy(() => import("./pages/admin/AdminDatabase"));
const AdminBackups = lazy(() => import("./pages/admin/AdminBackups"));
const AdminAffiliates = lazy(() => import("./pages/admin/AdminAffiliates"));

const DemoLayout = lazy(() => import("./components/demo/DemoLayout"));
const DemoDashboard = lazy(() => import("./pages/demo/DemoDashboard"));
const DemoTrades = lazy(() => import("./pages/demo/DemoTrades"));
const DemoAddTrade = lazy(() => import("./pages/demo/DemoAddTrade"));
const DemoAnalytics = lazy(() => import("./pages/demo/DemoAnalytics"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function ReferralCapture() {
  const loc = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const code = params.get("ref");
    if (code) {
      captureReferralFromUrl();
      (async () => {
        await (supabase as any).functions.invoke("track-click", {
          body: { code, ua: navigator.userAgent, referrer: document.referrer || null },
        });
      })();
    }
  }, [loc.search]);
  return null;
}

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  </div>
);

const DemoPage = ({ component: Component }: { component: React.ComponentType<{ openModal: (msg?: string) => void }> }) => (
  <DemoLayout>
    {({ openModal }: { openModal: (msg?: string) => void }) => <Component openModal={openModal} />}
  </DemoLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <CustomCursor />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ReferralCapture />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/start-trial" element={<Navigate to="/signup" replace />} />
              <Route path="/affiliate" element={<Affiliate />} />
              <Route path="/affiliate/dashboard" element={<AffiliateDashboard />} />

              {/* Demo routes - no auth required */}
              <Route path="/demo" element={<DemoPage component={DemoDashboard} />} />
              <Route path="/demo/trades" element={<DemoPage component={DemoTrades} />} />
              <Route path="/demo/add-trade" element={<DemoPage component={DemoAddTrade} />} />
              <Route path="/demo/analytics" element={<DemoPage component={DemoAnalytics} />} />

              {/* Authenticated routes */}
              <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
              <Route path="/dashboard/trades" element={<DashboardLayout><TradesPage /></DashboardLayout>} />
              <Route path="/dashboard/add-trade" element={<DashboardLayout><AddTradePage /></DashboardLayout>} />
              <Route path="/dashboard/analytics" element={<DashboardLayout><AnalyticsPage /></DashboardLayout>} />
              <Route path="/dashboard/insights" element={<DashboardLayout><InsightsPage /></DashboardLayout>} />
              <Route path="/dashboard/ai-trainer" element={<DashboardLayout><AITrainerPage /></DashboardLayout>} />
              <Route path="/dashboard/strategies" element={<DashboardLayout><StrategiesPage /></DashboardLayout>} />
              <Route path="/dashboard/reports" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />
              <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
              <Route path="/dashboard/upgrade" element={<DashboardLayout><UpgradePage /></DashboardLayout>} />
              <Route path="/dashboard/checkout" element={<Navigate to="/pricing" replace />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout><AdminOverview /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout requireSuper><AdminUsers /></AdminLayout>} />
              <Route path="/admin/plans" element={<AdminLayout requireSuper><AdminPlans /></AdminLayout>} />
              <Route path="/admin/content" element={<AdminLayout requireSuper><AdminContent /></AdminLayout>} />
              <Route path="/admin/ai" element={<AdminLayout requireSuper><AdminAI /></AdminLayout>} />
              <Route path="/admin/flags" element={<AdminLayout requireSuper><AdminFlags /></AdminLayout>} />
              <Route path="/admin/notifications" element={<AdminLayout requireSuper><AdminNotifications /></AdminLayout>} />
              <Route path="/admin/tickets" element={<AdminLayout><AdminTickets /></AdminLayout>} />
              <Route path="/admin/audit" element={<AdminLayout><AdminAudit /></AdminLayout>} />
              <Route path="/admin/billing" element={<AdminLayout requireSuper><AdminBilling /></AdminLayout>} />
              <Route path="/admin/database" element={<AdminLayout requireSuper><AdminDatabase /></AdminLayout>} />
              <Route path="/admin/backups" element={<AdminLayout requireSuper><AdminBackups /></AdminLayout>} />
              <Route path="/admin/trials" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/affiliates" element={<AdminLayout requireSuper><AdminAffiliates /></AdminLayout>} />
              <Route path="/admin/payments" element={<Navigate to="/admin" replace />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
