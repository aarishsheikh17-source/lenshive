import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/ui-app/Logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" aria-label="LensHive home">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-ink">
          <Link to="/browse" className="hover:text-dark transition">Browse</Link>
          <a href="/#how" className="hover:text-dark transition">How it works</a>
          <a href="/#photographers" className="hover:text-dark transition">For photographers</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/browse"
            className="hidden sm:inline-flex items-center text-sm font-medium text-ink hover:text-dark px-3 py-2"
          >
            Find a photographer
          </Link>
          <button
            type="button"
            disabled
            title="Sign-in coming soon"
            className="inline-flex items-center text-sm font-medium bg-honey text-dark px-4 py-2 rounded-md opacity-60 cursor-not-allowed"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
