import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing you in… — LensHive" }, { name: "robots", content: "noindex" }] }),
  component: Callback,
});

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const to = sessionStorage.getItem("lh_post_auth_redirect") || "/dashboard";
    const pendingType = sessionStorage.getItem("lh_pending_user_type");

    const finalize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/auth" });
        return;
      }
      // Persist chosen user_type from signup for Google flows.
      if (pendingType === "client" || pendingType === "photographer") {
        await supabase
          .from("profiles")
          .update({ user_type: pendingType })
          .eq("id", session.user.id);
        sessionStorage.removeItem("lh_pending_user_type");
      }
      sessionStorage.removeItem("lh_post_auth_redirect");
      navigate({ to: to.startsWith("/") ? to : "/dashboard" });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") finalize();
    });
    finalize();
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <p className="text-ink">Signing you in…</p>
    </div>
  );
}
