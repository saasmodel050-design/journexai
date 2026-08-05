import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import HeroSection from "@/components/home/HeroSection";
import WhatIsSection from "@/components/home/WhatIsSection";
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
      <Seo
        title="Journex Ai — AI Trading Coach That Finds Your Mistakes"
        description="Log trades in seconds. Journex AI detects emotional trading, tracks your performance, and coaches you like a private analyst. Free forever plan."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Journex AI",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1240" },
        }}
      />
      <Navbar />
      <HeroSection />
      <WhatIsSection />
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
