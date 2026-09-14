import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function SaveButton({ photographerId }: { photographerId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setSaved(false);
      return;
    }
    supabase
      .from("saved_photographers")
      .select("id")
      .eq("client_id", user.id)
      .eq("photographer_id", photographerId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setSaved(Boolean(data));
      });
    return () => {
      cancelled = true;
    };
  }, [user, photographerId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Sign in to save photographers");
      return;
    }
    if (busy) return;
    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      const { error } = next
        ? await supabase
            .from("saved_photographers")
            .insert({ client_id: user.id, photographer_id: photographerId })
        : await supabase
            .from("saved_photographers")
            .delete()
            .eq("client_id", user.id)
            .eq("photographer_id", photographerId);
      if (error) throw error;
      toast.success(next ? "Saved to your list" : "Removed from your list");
    } catch {
      setSaved(!next);
      toast.error("Could not update your saved list");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Remove from saved" : "Save photographer"}
      aria-pressed={saved}
      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface/95 backdrop-blur inline-flex items-center justify-center shadow-card hover:scale-105 transition"
    >
      <Heart
        size={17}
        className={saved ? "text-destructive" : "text-ink"}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
