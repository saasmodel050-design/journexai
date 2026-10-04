import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Blog — Coming Soon | Journex Ai"
        description="The Journex Ai blog is coming soon. Articles on trading psychology, risk management, and performance are on the way."
        path="/blog"
      />
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto py-24"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6 neon-glow">
              <Newspaper className="w-8 h-8 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Blog</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-4 mb-4">
              Coming <span className="gradient-text">Soon</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              We're working on articles about trading psychology, risk management, and
              performance improvement. Check back soon — or follow along by creating a
              free account and journaling your first trades today.
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
