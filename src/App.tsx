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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
