import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Privacy Policy — Journex Ai"
        description="How Journex Ai collects, uses, and protects your trading data and personal information."
        path="/privacy"
      />
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-12">Last updated: February 21, 2026</p>

            <div className="prose prose-invert max-w-none space-y-8">
              {[
                {
                  title: "1. Information We Collect",
                  content: "We collect information you provide directly to us, including your name, email address, trading data you choose to log, and payment information for premium plans. We also collect usage data such as how you interact with our platform, device information, and IP addresses.",
                },
                {
                  title: "2. How We Use Your Information",
                  content: "Your trading data is used exclusively to provide AI-powered analytics and insights. We analyze trading patterns, emotional indicators, and performance metrics to deliver personalized coaching. We never share your individual trading data with third parties or use it for any purpose other than improving your experience.",
                },
                {
                  title: "3. Analytics & Cookies",
                  content: "We use essential cookies for authentication and session management. Analytics cookies help us understand how traders use our platform to improve features. You can control cookie preferences through your browser settings. We use privacy-respecting analytics tools that do not sell your data.",
                },
                {
                  title: "4. Data Security",
                  content: "All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3. We implement industry-standard security measures including regular security audits, access controls, and intrusion detection systems. Your trading data is stored in SOC 2 Type II compliant data centers.",
                },
                {
                  title: "5. Your Rights",
                  content: "You have the right to access, correct, or delete your personal data at any time. You can export your complete trading data in standard formats. Upon account deletion, all personal data is permanently removed within 30 days. We comply with GDPR, CCPA, and other applicable data protection regulations.",
                },
                {
                  title: "6. Data Retention",
                  content: "We retain your data as long as your account is active or as needed to provide our services. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain certain information.",
                },
                {
                  title: "7. Third-Party Services",
                  content: "We may use third-party services for payment processing (Stripe), email communications, and infrastructure hosting. These providers are contractually obligated to protect your data and only use it as directed by us.",
                },
                {
                  title: "8. Contact Us",
                  content: "If you have questions about this Privacy Policy, please contact us at privacy@journexai.com.",
                },
              ].map((section, i) => (
                <div key={i} className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3">{section.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
