import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StartTrial from "./pages/StartTrial";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import TradesPage from "./pages/dashboard/TradesPage";
import AddTradePage from "./pages/dashboard/AddTradePage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import InsightsPage from "./pages/dashboard/InsightsPage";
import StrategiesPage from "./pages/dashboard/StrategiesPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import AITrainerPage from "./pages/dashboard/AITrainerPage";
import UpgradePage from "./pages/dashboard/UpgradePage";
import CheckoutPage from "./pages/dashboard/CheckoutPage";
import AdminPayments from "./pages/admin/AdminPayments";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminContent from "./pages/admin/AdminContent";
import AdminAI from "./pages/admin/AdminAI";
import AdminFlags from "./pages/admin/AdminFlags";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminDatabase from "./pages/admin/AdminDatabase";
import AdminBackups from "./pages/admin/AdminBackups";
import AdminTrials from "./pages/admin/AdminTrials";
import AdminAffiliates from "./pages/admin/AdminAffiliates";
import Affiliate from "./pages/Affiliate";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureReferralFromUrl } from "@/lib/referral";
import { supabase } from "@/integrations/supabase/client";

function ReferralCapture() {
  const loc = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const code = params.get("ref");
    if (code) {
      captureReferralFromUrl();
      (async () => {
        await (supabase as any).rpc("track_affiliate_click", {
          _code: code,
          _ua: navigator.userAgent,
          _referrer: document.referrer || null,
        });
      })();
    }
  }, [loc.search]);
  return null;
}

// Demo pages
import DemoLayout from "./components/demo/DemoLayout";
import DemoDashboard from "./pages/demo/DemoDashboard";
import DemoTrades from "./pages/demo/DemoTrades";
import DemoAddTrade from "./pages/demo/DemoAddTrade";
import DemoAnalytics from "./pages/demo/DemoAnalytics";

const queryClient = new QueryClient();

const DemoPage = ({ component: Component }: { component: React.ComponentType<{ openModal: (msg?: string) => void }> }) => {
  return (
    <DemoLayout>
      {({ openModal }: { openModal: (msg?: string) => void }) => <Component openModal={openModal} />}
    </DemoLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ReferralCapture />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/start-trial" element={<StartTrial />} />
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
            <Route path="/dashboard/checkout" element={<DashboardLayout><CheckoutPage /></DashboardLayout>} />

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
            <Route path="/admin/trials" element={<AdminLayout requireSuper><AdminTrials /></AdminLayout>} />
            <Route path="/admin/affiliates" element={<AdminLayout requireSuper><AdminAffiliates /></AdminLayout>} />
            <Route path="/admin/payments" element={<AdminLayout requireSuper><AdminPayments /></AdminLayout>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
