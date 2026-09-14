import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui-app/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { user, isReady } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const mobileLink =
    "block px-4 py-3 text-sm text-ink hover:bg-cream rounded-md transition";

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-border"
    >
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
          <div className="hidden md:flex items-center gap-2">
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
                  className="inline-flex items-center text-sm font-medium text-ink hover:text-dark px-3 py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="inline-flex items-center text-sm font-medium bg-honey text-dark px-4 py-2 rounded-md hover:bg-amber transition"
                >
                  Join free
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-border bg-surface text-ink hover:bg-cream transition"
          >
            {open ? <Menu size={20} className="hidden" /> : null}
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-cream/95 backdrop-blur">
          <nav className="px-4 py-3 space-y-1">
            <Link to="/browse" className={mobileLink} onClick={() => setOpen(false)}>
              Browse
            </Link>
            <a href="/#how" className={mobileLink} onClick={() => setOpen(false)}>
              How it works
            </a>
            <a href="/#photographers" className={mobileLink} onClick={() => setOpen(false)}>
              For photographers
            </a>
            <div className="pt-2 mt-2 border-t border-border space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block text-center text-sm font-medium bg-honey text-dark px-4 py-2.5 rounded-md hover:bg-amber transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full text-center text-sm font-medium text-ink border border-border rounded-md px-4 py-2.5 hover:bg-white transition"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    search={{ mode: "signin" }}
                    onClick={() => setOpen(false)}
                    className="block text-center text-sm font-medium text-ink border border-border rounded-md px-4 py-2.5 hover:bg-white transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    onClick={() => setOpen(false)}
                    className="block text-center text-sm font-medium bg-honey text-dark px-4 py-2.5 rounded-md hover:bg-amber transition"
                  >
                    Join free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
