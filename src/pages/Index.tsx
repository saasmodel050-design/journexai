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
import FAQSection, { faqs } from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";

const UPDATED = "2026-08-07";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="AI Trading Journal & Coach | Journex Ai"
        description="Journex Ai is an AI trading journal and coach for crypto, forex, and futures. Log trades in seconds, spot emotional mistakes, and get AI insights. Free plan."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Journex AI",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1240" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://journexai.vercel.app/" },
              { "@type": "ListItem", position: 2, name: "Pricing", item: "https://journexai.vercel.app/pricing" },
              { "@type": "ListItem", position: 3, name: "About", item: "https://journexai.vercel.app/about" },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "AI Trading Journal & Coach | Journex Ai",
            description:
              "Journex Ai is an AI trading journal and coach for crypto, forex, and futures traders.",
            url: "https://journexai.vercel.app/",
            datePublished: "2026-01-15",
            dateModified: UPDATED,
            inLanguage: "en",
            about: { "@type": "Thing", name: "AI trading journal" },
            audience: {
              "@type": "Audience",
              audienceType: "Crypto, forex and futures traders",
            },
            publisher: {
              "@type": "Organization",
              name: "Journex Ai",
              url: "https://journexai.vercel.app",
            },
          },
        ]}
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
      <FAQSection />
      <CTASection />
      <div className="container mx-auto px-4 pb-10">
        <p className="text-center text-xs text-muted-foreground">
          Published January 15, 2026 · Last updated{" "}
          <time dateTime={UPDATED}>August 7, 2026</time>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
