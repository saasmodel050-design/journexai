import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="glass-card p-12 md:p-16 text-center max-w-3xl mx-auto relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Improving Your Trading <span className="gradient-text">Today</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of traders who are using AI to break bad habits and build consistent profits.
            </p>
            <Link to="/signup">
              <Button size="lg" className="neon-glow text-base px-8 py-6 font-semibold">
                Start Journaling Trades — It's Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">No credit card required. Free forever plan available.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
