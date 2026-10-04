import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import journexLogo from "@/assets/journex_logo.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={journexLogo} alt="Journex Ai" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-foreground">
                Journex<span className="text-primary"> Ai</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your AI Trading Coach that helps you stop repeating mistakes.
            </p>
            <a
              href="mailto:journex.ai.trade@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors break-all"
            >
              <Mail className="w-4 h-4 shrink-0" />
              journex.ai.trade@gmail.com
            </a>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Product</h3>
            <ul className="space-y-3">
              {[
                { label: "Features", to: "/#features" },
                { label: "Pricing", to: "/pricing" },
                { label: "Dashboard", to: "/dashboard" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Resources</h3>
            <ul className="space-y-3">
              {[
                { label: "Blog", to: "/blog" },
                { label: "Affiliate Program", to: "/affiliate" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About", to: "/about" },
                { label: "Contact", to: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:journex.ai.trade@gmail.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {year} Journex Ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
