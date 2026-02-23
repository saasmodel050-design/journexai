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

const queryClient = new QueryClient();

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
            <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
            <Route path="/dashboard/trades" element={<DashboardLayout><TradesPage /></DashboardLayout>} />
            <Route path="/dashboard/add-trade" element={<DashboardLayout><AddTradePage /></DashboardLayout>} />
            <Route path="/dashboard/analytics" element={<DashboardLayout><AnalyticsPage /></DashboardLayout>} />
            <Route path="/dashboard/insights" element={<DashboardLayout><InsightsPage /></DashboardLayout>} />
            <Route path="/dashboard/strategies" element={<DashboardLayout><StrategiesPage /></DashboardLayout>} />
            <Route path="/dashboard/reports" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
