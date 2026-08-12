import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — LensHive" },
      { name: "description", content: "Set a new password for your LensHive account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash; onAuthStateChange fires PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated! Please sign in.");
    navigate({ to: "/auth" });
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="flex items-center gap-3 text-ink/70">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Verifying reset link…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-serif text-3xl text-dark">Set new password</h1>
          <p className="mt-1 text-sm text-ink/70">Choose a strong password for your LensHive account.</p>

          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-ink" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1 w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className="mt-1 w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-honey text-dark font-medium px-4 py-2.5 rounded-md hover:bg-amber transition disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
