// Single source of truth for per-route static <head> metadata.
// Used by scripts/prerender.mjs to emit a real HTML file per public route.
export const SITE = "https://journexai.vercel.app";

export const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/rdYEV4P2UaSKCCo9g924AFCvZS12/social-images/social-1771938336381-journex_logo.webp";

export const routes = [
  {
    path: "/",
    title: "AI Trading Journal & Coach | Journex Ai",
    description:
      "Journex Ai is an AI trading journal and coach for crypto, forex, and futures. Log trades in seconds, spot emotional mistakes, and get AI insights. Free plan.",
  },
  {
    path: "/pricing",
    title: "Pricing — Free & Pro Plans | Journex Ai",
    description:
      "Simple, transparent pricing for Journex Ai. Start free and upgrade to Pro for the full AI trading coach, unlimited trades, and advanced analytics.",
  },
  {
    path: "/about",
    title: "About Journex Ai — Our Mission for Traders",
    description:
      "Learn who builds Journex Ai, why we created an AI trading journal, and how we help crypto, forex, and futures traders fix costly emotional mistakes.",
  },
  {
    path: "/blog",
    title: "Trading Blog — Psychology, Risk & Performance | Journex Ai",
    description:
      "Expert articles on trading psychology, risk management, mistake patterns, and performance optimization from the Journex Ai team.",
  },
  {
    path: "/contact",
    title: "Contact Journex Ai — Support & Sales",
    description:
      "Get in touch with the Journex Ai team for product support, billing questions, partnerships, or feedback on the AI trading journal.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Journex Ai",
    description:
      "How Journex Ai collects, stores, and protects your trading data and personal information, plus your rights and how to contact us.",
  },
  {
    path: "/affiliate",
    title: "Affiliate Program — Earn 25% Recurring | Journex Ai",
    description:
      "Join the Journex Ai affiliate program and earn 25% recurring commission for every trader you refer to our AI trading journal and coach.",
  },
  {
    path: "/demo",
    title: "Live Demo — Try the AI Trading Journal | Journex Ai",
    description:
      "Explore a fully interactive Journex Ai demo dashboard with sample trades, analytics, and AI insights. No signup required.",
  },
  {
    path: "/signup",
    title: "Create Your Free Account | Journex Ai",
    description:
      "Sign up free for Journex Ai and start logging trades, tracking emotions, and getting AI coaching on your crypto, forex, and futures trading.",
  },
  {
    path: "/login",
    title: "Log In | Journex Ai",
    description: "Log in to your Journex Ai account to access your trading journal, analytics, and AI coach.",
  },
];
