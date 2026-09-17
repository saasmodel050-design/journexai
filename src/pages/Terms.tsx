import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Seo from '@/components/Seo';
import { motion } from 'framer-motion';

const sections = [
  { title: '1. Service Description', content: 'Journex Ai provides trade journaling, performance analytics, reporting, and AI-assisted educational insights for crypto, forex, and futures traders.' },
  { title: '2. Not Financial Advice', content: 'Journex Ai is a journaling and analytics tool only. Nothing in the service is financial, investment, legal, or tax advice. We do not recommend trades, manage funds, or guarantee trading profits or any particular result. Trading involves substantial risk, and you remain solely responsible for every trading decision.' },
  { title: '3. Account Responsibilities', content: 'You must provide accurate information, keep your login credentials secure, and promptly notify us of suspected unauthorized use. You are responsible for activity under your account and must be legally able to enter this agreement.' },
  { title: '4. Subscription Billing', content: 'Pro subscriptions are billed on a recurring monthly or yearly basis through Whop. You may cancel or change your plan at any time through your Whop account. After cancellation, Pro access continues until the end of the paid billing period and will not renew.' },
  { title: '5. Refund Policy', content: 'Payments are generally non-refundable once a billing period begins, except where required by applicable law or expressly stated at purchase. For billing questions, contact us promptly at journex.ai.trade@gmail.com.' },
  { title: '6. Acceptable Use', content: 'You may not misuse the service, attempt unauthorized access, disrupt its operation, scrape or resell protected content, upload malicious code, infringe another person’s rights, or use Journex Ai for unlawful activity.' },
  { title: '7. Data Ownership and Export', content: 'You retain ownership of the trading information and other content you submit. You grant us the limited rights needed to process that data and provide the service. You may request or use available tools to export your trading data.' },
  { title: '8. Limitation of Liability', content: 'To the fullest extent permitted by law, Journex Ai and its operators are not liable for trading losses, lost profits, indirect or consequential damages, data loss, or decisions made using the service. The service is provided without any guarantee of uninterrupted availability or analytical accuracy.' },
  { title: '9. Termination', content: 'You may stop using the service at any time. We may suspend or terminate access for violations of these terms, unlawful activity, security risks, or nonpayment. Provisions that by their nature should survive termination will remain effective.' },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Terms of Service — Journex Ai" description="Terms governing Journex Ai accounts, subscriptions, trading analytics, data, and acceptable use." path="/terms" />
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: September 17, 2026</p>
            <div className="border border-destructive/40 bg-destructive/10 p-5 mb-10 rounded-lg">
              <h2 className="font-semibold text-foreground mb-2">Not financial advice</h2>
              <p className="text-sm text-muted-foreground">Journex Ai does not provide financial advice or guarantee trading profits. You are responsible for your own trading decisions and risk.</p>
            </div>
            <div className="prose prose-invert max-w-none space-y-8">
              {sections.map((section) => (
                <div key={section.title} className="glass-card p-6">
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
}