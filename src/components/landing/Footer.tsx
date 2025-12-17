import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[hsl(var(--ink))] text-white py-16 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <span className="hero-text text-3xl md:text-4xl font-bold text-accent">
              Verity
            </span>
          </div>

          {/* Center: Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/60 text-sm md:text-base">
            <Link to="/vision" className="hover:text-accent transition-smooth">
              Our Vision
            </Link>
            <span className="text-white/40">·</span>
            <Link to="/safety" className="hover:text-accent transition-smooth">
              Safety
            </Link>
            <span className="text-white/40">·</span>
            <Link to="/privacy" className="hover:text-accent transition-smooth">
              Privacy
            </Link>
            <span className="text-white/40">·</span>
            <Link to="/terms" className="hover:text-accent transition-smooth">
              Terms
            </Link>
            <span className="text-white/40">·</span>
            <a href="https://instagram.com/verityau" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-smooth">
              Instagram
            </a>
            <span className="text-white/40">·</span>
            <a href="https://tiktok.com/@verityau" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-smooth">
              TikTok
            </a>
            <span className="text-white/40">·</span>
            <a href="mailto:hello@verity.au" className="hover:text-accent transition-smooth">
              hello@verity.au
            </a>
          </div>

          {/* Right: Copyright */}
          <div className="flex-shrink-0 text-white/50 text-sm md:text-base text-center md:text-right">
            Made with intention in Australia © 2025
          </div>
        </div>
      </div>
    </footer>
  );
};
