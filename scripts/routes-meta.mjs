// Single source of truth for per-route <head> metadata.
// Consumed by:
//   - scripts/prerender.mjs  -> writes a real static HTML head per public route
//   - src/lib/routeMeta.ts   -> the client <Seo> component (identical values)
// Keeping both sides on this file guarantees JS-less crawlers (Facebook,
// LinkedIn, X, ChatGPT, Perplexity, Bing) see exactly what Googlebot renders.
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
    title: "About Journex Ai — AI Trading Journal & Coach",
    description:
      "Journex Ai turns your trading data into a personal AI coach for crypto, forex, and futures. Learn our mission, story, and how we help traders break bad habits.",
  },
  {
    path: "/blog",
    title: "Trading Blog — Psychology, Risk & Performance | Journex Ai",
    description:
      "Expert articles on trading psychology, risk management, mistake patterns, and performance optimization from the Journex Ai team.",
  },
  {
    path: "/contact",
    title: "Contact Journex Ai — Support, Partnerships & FAQs",
    description:
      "Reach the Journex Ai team for product support, partnerships, and answers to common trading-journal questions.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy — Journex Ai",
    description:
      "How Journex Ai collects, uses, and protects your trading data and personal information.",
  },
  {
    path: "/affiliate",
    title: "Affiliate Program — Earn 20% with Journex Ai",
    description:
      "Promote Journex Ai and earn recurring 20% commissions on every Pro plan referral with real-time tracking and fast payouts.",
  },
  {
    path: "/demo",
    title: "Live Demo — Try the AI Trading Journal | Journex Ai",
    description:
      "Explore a fully interactive Journex Ai demo dashboard with sample trades, analytics, and AI insights. No signup required.",
  },
  {
    path: "/demo/trades",
    title: "Demo Trade Log — AI Trading Journal | Journex Ai",
    description:
      "See how Journex Ai logs and organises trades with sample data: entries, exits, R multiples, emotions and session tags.",
  },
  {
    path: "/demo/add-trade",
    title: "Demo — Log a Trade in Seconds | Journex Ai",
    description:
      "Try the Journex Ai trade entry form with sample data and see how fast journaling a crypto, forex or futures trade can be.",
  },
  {
    path: "/demo/analytics",
    title: "Demo Analytics — Trading Performance Insights | Journex Ai",
    description:
      "Preview Journex Ai analytics: win rate, expectancy, drawdown, emotion breakdowns and AI-detected mistake patterns.",
  },
  {
    path: "/signup",
    title: "Create your free Journex Ai account",
    description:
      "Sign up free to start journaling trades, tracking emotions, and getting AI insights for crypto, forex, and futures.",
  },
  {
    path: "/login",
    title: "Login — Journex Ai",
    description:
      "Sign in to your Journex Ai account to access your AI trading journal, insights, and coach.",
  },
  {
    path: "/terms",
    title: "Terms of Service — Journex Ai",
    description:
      "The terms governing your use of Journex Ai: accounts, subscriptions, billing, data ownership, and acceptable use.",
  },
  // Private app routes: prerendered as real pages so deep links work on any
  // host (even without SPA rewrites), and kept out of search indexes.
  {
    path: "/forgot-password",
    title: "Reset your password — Journex Ai",
    description: "Request a password reset link for your Journex Ai account.",
    noindex: true,
  },
  {
    path: "/reset-password",
    title: "Set a new password — Journex Ai",
    description: "Choose a new password for your Journex Ai account.",
    noindex: true,
  },
  {
    path: "/checkout/success",
    title: "Payment confirmation — Journex Ai",
    description: "Confirming your Journex Ai Pro subscription payment.",
    noindex: true,
  },
  ...["", "/trades", "/add-trade", "/analytics", "/insights", "/ai-trainer", "/strategies", "/reports", "/settings", "/upgrade"].map(
    (p) => ({
      path: `/dashboard${p}`,
      title: p ? `Dashboard ${p.replace(/^\//, "").replace(/-/g, " ")} — Journex Ai` : "Dashboard — Journex Ai",
      description: "Your private Journex Ai trading journal and AI coach workspace.",
      noindex: true,
    })
  ),
  ...["/login", "", "/users", "/plans", "/affiliates", "/content", "/ai", "/flags", "/notifications", "/tickets", "/audit", "/billing", "/database", "/backups"].map(
    (p) => ({
      path: `/admin${p}`,
      title: p ? `Admin ${p.replace(/^\//, "")} — Journex Ai` : "Admin — Journex Ai",
      description: "Journex Ai administration area. Authorized staff only.",
      noindex: true,
    })
  ),
];
