import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/ui-app/Logo";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isReady } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" aria-label="LensHive — Professional Photographer Directory, home">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-ink">
          <Link to="/browse" className="hover:text-dark transition">Browse</Link>
          <a href="/#how" className="hover:text-dark transition">How it works</a>
          <a href="/#photographers" className="hover:text-dark transition">For photographers</a>
        </nav>
        <div className="flex items-center gap-2">
          {!isReady ? (
            <div className="w-24 h-9 rounded-md bg-white/40 animate-pulse" />
          ) : user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-medium bg-honey text-dark px-4 py-2 rounded-md hover:bg-amber transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="hidden sm:inline-flex items-center text-sm font-medium text-ink hover:text-dark px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex items-center text-sm font-medium bg-honey text-dark px-4 py-2 rounded-md hover:bg-amber transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
