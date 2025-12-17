import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--ink))]">
      <div className="text-center">
        <h1 className="hero-text mb-6 text-8xl text-white">404</h1>
        <p className="body-large mb-8 text-white/70">Oops! Page not found</p>
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold transition-smooth shadow-gold">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
