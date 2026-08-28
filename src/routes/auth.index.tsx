import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — LensHive" },
      { name: "description", content: "Sign in or create an account to hire photographers or list your photography services on LensHive." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/" });
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"client" | "photographer">("client");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const redirectTo = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/dashboard";

  function goToRedirect() {
    // consent URLs contain query strings / dots — bypass typed router and hard-navigate.
    if (redirectTo.includes("?") || redirectTo.startsWith("/.")) {
      window.location.href = redirectTo;
    } else {
      navigate({ to: redirectTo });
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) goToRedirect();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, user_type: userType },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
      goToRedirect();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      // Remember intended destination and user_type (for signup) across the OAuth round-trip.
      sessionStorage.setItem("lh_post_auth_redirect", redirectTo);
      if (mode === "signup") sessionStorage.setItem("lh_pending_user_type", userType);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth/callback",
      });
      if (result.error) throw result.error;
      // If not redirected (popup flow), session is set — proceed.
      if (!result.redirected) goToRedirect();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setForgotLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Security best practice: don't reveal whether the email exists.
    toast.success("If that email is registered, you'll receive a reset link shortly.");
    setShowForgot(false);
    setForgotEmail("");
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-serif text-3xl text-dark">
            {mode === "signin" ? "Welcome back" : "Join LensHive"}
          </h1>
          <p className="mt-1 text-sm text-ink/70">
            {mode === "signin"
              ? "Sign in to book photographers or manage your listings."
              : "Create your account in a minute."}
          </p>

          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 mt-6">
              <h2 className="font-serif text-2xl text-dark">Reset your password</h2>
              <p className="text-sm text-ink/70">Enter your email and we'll send you a reset link.</p>
              <div>
                <label className="text-xs font-medium text-ink" htmlFor="forgotEmail">Email</label>
                <input
                  id="forgotEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1 w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-honey text-dark font-medium px-4 py-2.5 rounded-md hover:bg-amber transition disabled:opacity-60"
              >
                {forgotLoading ? "Sending…" : "Send reset link"}
              </button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full text-sm text-ink/70 hover:text-dark"
              >
                Back to login
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 border border-border bg-white hover:bg-cream px-4 py-2.5 rounded-md text-sm font-medium text-dark disabled:opacity-60"
              >
                <GoogleIcon /> Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-ink/50">
                <span className="flex-1 h-px bg-border" /> or <span className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === "signup" && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-ink" htmlFor="fullName">Full name</label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div role="radiogroup" aria-labelledby="user-type-label">
                      <span id="user-type-label" className="text-xs font-medium text-ink">I'm signing up as</span>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {(["client", "photographer"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            role="radio"
                            aria-checked={userType === t}
                            aria-label={t === "client" ? "Sign up as a Client (hire photographers)" : "Sign up as a Photographer (list your services)"}
                            onClick={() => setUserType(t)}
                            className={`text-sm px-3 py-2 rounded-md border transition ${
                              userType === t
                                ? "bg-honey/20 border-honey text-dark"
                                : "bg-white border-border text-ink hover:bg-cream"
                            }`}
                          >
                            {t === "client" ? "Client" : "Photographer"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-xs font-medium text-ink" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                  />
                  {mode === "signin" && (
                    <div className="text-right mt-1">
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-honey text-dark font-medium px-4 py-2.5 rounded-md hover:bg-amber transition disabled:opacity-60"
                >
                  {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-sm text-ink/70">
            {mode === "signin" ? (
              <>New here?{" "}
                <button className="text-dark underline" onClick={() => setMode("signup")}>
                  Create an account
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button className="text-dark underline" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </>
            )}
          </p>
          <p className="mt-2 text-center">
            <Link to="/" className="text-xs text-ink/60 hover:text-dark">← Back to home</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 12.5 24 12.5c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.6 2.4-7.4 2.4-5.2 0-9.6-3.3-11.3-7.9L6 32.5C9.3 39 16.1 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C41.9 34.9 44 30 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
