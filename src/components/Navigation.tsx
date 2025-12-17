import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Menu, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  customTitle?: string;
  customSubtitle?: string;
}

const Navigation = ({ customTitle, customSubtitle }: NavigationProps = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-[hsl(var(--ink))]/95 backdrop-blur-xl border-b border-white/10 shadow-elegant"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          {customTitle ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-smooth hover:bg-white/10 hover:border-white/20"
              >
                <ArrowLeft className="h-5 w-5 text-white/70" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-white">{customTitle}</h1>
                {customSubtitle && <p className="text-sm text-white/50">{customSubtitle}</p>}
              </div>
            </div>
          ) : (
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center transition-smooth group-hover:bg-accent/20 group-hover:border-accent/40">
              <Heart className="h-6 w-6 text-accent fill-accent" />
            </div>
            <span className="hero-text text-xl text-white">Verity</span>
          </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/how-it-works"
              className="text-sm font-medium text-white/70 hover:text-accent transition-smooth"
            >
              How It Works
            </Link>
            <Link
              to="/vision"
              className="text-sm font-medium text-white/70 hover:text-accent transition-smooth"
            >
              The Verity Vision
            </Link>
            <Link
              to="/safety"
              className="text-sm font-medium text-white/70 hover:text-accent transition-smooth"
            >
              Safety
            </Link>
            <Link
              to="/faq"
              className="text-sm font-medium text-white/70 hover:text-accent transition-smooth"
            >
              FAQ
            </Link>
          </div>

          {/* Desktop CTA Button */}
          <Button asChild size="default" className="hidden md:inline-flex bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-gold transition-smooth">
            <Link to="/auth">Get Started</Link>
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-smooth"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[hsl(var(--ink))]/95 backdrop-blur-xl border-b border-white/10 shadow-elegant">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-3 px-4 text-base font-medium text-white hover:bg-white/5 hover:text-accent rounded-lg transition-smooth"
              >
                How It Works
              </Link>
              <Link
                to="/vision"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-3 px-4 text-base font-medium text-white hover:bg-white/5 hover:text-accent rounded-lg transition-smooth"
              >
                The Verity Vision
              </Link>
              <Link
                to="/safety"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-3 px-4 text-base font-medium text-white hover:bg-white/5 hover:text-accent rounded-lg transition-smooth"
              >
                Safety
              </Link>
              <Link
                to="/faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-3 px-4 text-base font-medium text-white hover:bg-white/5 hover:text-accent rounded-lg transition-smooth"
              >
                FAQ
              </Link>
              <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full mt-4 transition-smooth">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navigation;
