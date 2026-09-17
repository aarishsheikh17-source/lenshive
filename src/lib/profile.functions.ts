import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the signed-in user's own profile, including contact fields that are
 * not readable through the Data API. Scoped strictly to context.userId.
 */
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, phone, city, country, avatar_url, user_type, is_verified")
      .eq("id", context.userId)
      .maybeSingle();
    return data ?? null;
  });
