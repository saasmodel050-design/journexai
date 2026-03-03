import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";
import journexLogo from "@/assets/journex_logo.png";

const Footer = () => {
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
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
            <ul className="space-y-3">
              {["Features", "Pricing", "Dashboard", "API"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Resources</h4>
            <ul className="space-y-3">
              {["Blog", "Documentation", "Help Center", "Community"].map((item) => (
                <li key={item}>
                  <Link to={item === "Blog" ? "/blog" : "#"} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "Careers", to: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Journex Ai. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center glass-card px-1 py-1 rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground ml-3 mr-2" />
              <input
                type="email"
                placeholder="Subscribe to updates"
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2 px-1 w-48"
              />
              <button className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
