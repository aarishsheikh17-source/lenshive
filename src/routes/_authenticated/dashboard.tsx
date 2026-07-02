import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Camera, Heart, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — LensHive" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

type ProfileRow = { full_name: string | null; user_type: string | null };

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name, user_type")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(data ?? { full_name: null, user_type: "client" });
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const isPhotographer = profile?.user_type === "photographer";

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-4xl text-dark">
              Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-ink/70">
              Signed in as {email} · {isPhotographer ? "Photographer" : "Client"}
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-sm border border-border bg-white px-4 py-2 rounded-md hover:bg-white/60"
          >
            Sign out
          </button>
        </div>

        {loading ? (
          <div className="mt-10 h-40 rounded-xl bg-white/60 animate-pulse" />
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isPhotographer ? (
              <>
                <Card icon={<Camera className="size-5" />} title="Your listing" desc="Editing your public profile, pricing and portfolio is coming in the next phase." />
                <Card icon={<MessageSquare className="size-5" />} title="Enquiries" desc="Client enquiries will appear here once your listing is live." />
                <Card icon={<Heart className="size-5" />} title="Reviews" desc="Ratings and reviews from past clients will show up here." />
              </>
            ) : (
              <>
                <Card icon={<Heart className="size-5" />} title="Saved photographers" desc="Photographers you save while browsing will appear here." />
                <Card icon={<MessageSquare className="size-5" />} title="Your enquiries" desc="Track messages you've sent to photographers." />
                <Card icon={<Camera className="size-5" />} title="Become a photographer" desc="Want to list your services? Upgrade your account in the next phase." />
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Card({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="inline-flex items-center justify-center size-9 rounded-full bg-honey/20 text-dark">{icon}</div>
      <h3 className="mt-3 font-serif text-xl text-dark">{title}</h3>
      <p className="mt-1 text-sm text-ink/70">{desc}</p>
    </div>
  );
}
