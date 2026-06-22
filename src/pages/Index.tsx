import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import HeroSection from "@/components/home/HeroSection";
import ProblemSection from "@/components/home/ProblemSection";
import SolutionSection from "@/components/home/SolutionSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import DashboardPreview from "@/components/home/DashboardPreview";
import HowItWorks from "@/components/home/HowItWorks";
import AIInsights from "@/components/home/AIInsights";
import PricingSection from "@/components/home/PricingSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Journex Ai — AI-Powered Trading Journal & Performance Analytics"
        description="Track trades, detect emotional patterns, and improve performance with AI-powered insights for crypto, forex, and futures traders."
        path="/"
      />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <DashboardPreview />
      <HowItWorks />
      <AIInsights />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
