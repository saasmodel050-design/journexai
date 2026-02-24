import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Chen",
    handle: "@alextrading",
    avatar: "AC",
    text: "TradeMind AI completely changed how I approach my trades. The mistake detection caught patterns I never noticed — I was revenge trading after losses and didn't even realize it.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    handle: "@sarahfx",
    avatar: "SM",
    text: "The emotion tracking feature is incredible. I can now see exactly when FOMO is affecting my decisions. My win rate improved by 22% in just two months.",
    rating: 5,
  },
  {
    name: "David Rodriguez",
    handle: "@drodtrader",
    avatar: "DR",
    text: "Best trading journal I've used. The AI insights are actually useful — not generic advice but specific patterns from MY trading data. Worth every penny.",
    rating: 5,
  },
  {
    name: "Maria Koslov",
    handle: "@mariaktrading",
    avatar: "MK",
    text: "I've been trading for 4 years and tried every journal out there. TradeMind's AI coach is the closest thing to having a real mentor watching your trades 24/7.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);

  const visibleCount = 2;
  const maxIndex = testimonials.length - visibleCount;

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-primary/4 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">TradeMind AI</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 font-display">
                Reviews from our{" "}
                <span className="gradient-text">traders</span>
              </h2>
            </div>
            <div className="lg:text-right">
              <p className="text-muted-foreground max-w-md lg:ml-auto">
                We've been building trading intelligence tools for over 4 years, helping thousands 
                of traders improve their performance. Here's what they say.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Testimonial cards */}
        <div className="relative">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.slice(current, current + visibleCount).map((t, i) => (
              <motion.div
                key={`${current}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.handle}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-foreground hover:border-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent(Math.min(maxIndex, current + 1))}
              disabled={current >= maxIndex}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-foreground hover:border-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
