import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

const categories = ["All", "Trading Psychology", "Risk Management", "Trading Mistakes", "Strategy Improvement", "Performance Optimization"];

const posts = [
  {
    title: "Why Most Traders Repeat the Same Mistakes",
    category: "Trading Psychology",
    excerpt: "The human brain is wired to repeat patterns. Without awareness, even experienced traders fall into the same traps.",
    date: "Feb 18, 2026",
    readTime: "5 min",
  },
  {
    title: "How Emotional Trading Destroys Profits",
    category: "Trading Mistakes",
    excerpt: "FOMO, revenge trading, and overconfidence — the three emotions that account for 70% of avoidable losses.",
    date: "Feb 14, 2026",
    readTime: "7 min",
  },
  {
    title: "The Importance of a Trading Journal",
    category: "Performance Optimization",
    excerpt: "Traders who journal consistently improve their win rate by an average of 12% within three months.",
    date: "Feb 10, 2026",
    readTime: "4 min",
  },
  {
    title: "How AI Can Improve Your Trading Performance",
    category: "Strategy Improvement",
    excerpt: "Machine learning can detect patterns across thousands of trades that would take humans months to find.",
    date: "Feb 6, 2026",
    readTime: "6 min",
  },
  {
    title: "Position Sizing: The Most Overlooked Edge",
    category: "Risk Management",
    excerpt: "Most traders focus on entries, but position sizing is what separates profitable traders from the rest.",
    date: "Feb 2, 2026",
    readTime: "8 min",
  },
  {
    title: "Building a Pre-Trade Checklist That Works",
    category: "Strategy Improvement",
    excerpt: "A simple 5-step checklist that reduces impulsive trades by over 40% according to our user data.",
    date: "Jan 28, 2026",
    readTime: "5 min",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Trading Blog — Psychology, Risk & Performance | Journex Ai"
        description="Expert articles on trading psychology, risk management, mistake patterns, and performance optimization from the Journex Ai team."
        path="/blog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Journex Ai Blog",
          url: "https://journexai.lovable.app/blog",
        }}
      />
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Blog</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-4 mb-4">
              Trading <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-muted-foreground">
              Expert articles on trading psychology, risk management, and performance optimization.
            </p>
          </motion.div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts */}
          <h2 className="sr-only">Latest articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {posts.map((post, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-6 flex flex-col cursor-pointer group"
              >
                <span className="text-xs font-medium text-primary mb-3">{post.category}</span>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {post.readTime} · {post.date}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
