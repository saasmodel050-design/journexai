import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import ProblemSection from "@/components/home/ProblemSection";
import SolutionSection from "@/components/home/SolutionSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import DashboardPreview from "@/components/home/DashboardPreview";
import HowItWorks from "@/components/home/HowItWorks";
import AIInsights from "@/components/home/AIInsights";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PricingSection from "@/components/home/PricingSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <DashboardPreview />
      <HowItWorks />
      <AIInsights />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
