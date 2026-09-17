import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  bookingConfirmedClientHTML,
  bookingConfirmedPhotographerHTML,
  clientConfirmationHTML,
  enquiryToPhotographerHTML,
  welcomePhotographerHTML,
} from "./email-templates";

// NOTE: requires the RESEND_API_KEY secret (Project Settings → Secrets).
// Get the key from resend.com → API Keys. The "from" domain must be verified in Resend.
const FROM = "LensHive <notifications@lenshive.in>";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey || !to) {
    console.error("[notifications] missing RESEND_API_KEY or recipient");
    return { sent: false as const };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    console.error(`[notifications] Resend failed [${res.status}]: ${await res.text()}`);
    return { sent: false as const };
  }
  return { sent: true as const };
}

/**
 * Sends the photographer notification + client confirmation for an existing enquiry.
 * Takes only the enquiry id: all recipient data is read server-side, so this
 * endpoint can never be used to send mail to an arbitrary address.
 */
export const notifyEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ enquiryId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: enquiry } = await supabaseAdmin
        .from("enquiries")
        .select(
          "id, photographer_id, client_name, client_email, client_phone, shoot_date, shoot_type, booking_type, location, message",
        )
        .eq("id", data.enquiryId)
        .maybeSingle();
      if (!enquiry) return { ok: false as const };

      const { data: photographer } = await supabaseAdmin
        .from("photographer_profiles")
        .select("id, user_id")
        .eq("id", enquiry.photographer_id)
        .maybeSingle();
      if (!photographer) return { ok: false as const };

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name")
        .eq("id", photographer.user_id)
        .maybeSingle();

      const photographerName = profile?.full_name ?? "the photographer";

      await Promise.all([
        profile?.email
          ? sendEmail(
              profile.email,
              `New enquiry from ${enquiry.client_name} — LensHive`,
              enquiryToPhotographerHTML({
                photographerName,
                clientName: enquiry.client_name,
                clientEmail: enquiry.client_email,
                clientPhone: enquiry.client_phone,
                shootDate: enquiry.shoot_date,
                shootType: enquiry.shoot_type,
                bookingType: enquiry.booking_type,
                location: enquiry.location,
                message: enquiry.message,
              }),
            )
          : Promise.resolve(),
        sendEmail(
          enquiry.client_email,
          `Your enquiry was sent to ${photographerName} — LensHive`,
          clientConfirmationHTML({
            clientName: enquiry.client_name,
            photographerName,
            photographerId: enquiry.photographer_id,
            shootDate: enquiry.shoot_date,
          }),
        ),
      ]);

      return { ok: true as const };
    } catch (err) {
      console.error("[notifications] notifyEnquiry error:", err);
      return { ok: false as const };
    }
  });

/**
 * Welcome email for a newly registered photographer. The address is resolved
 * from the profiles table by user id, never taken from the caller.
 */
export const notifyWelcomePhotographer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name, user_type")
        .eq("id", data.userId)
        .maybeSingle();
      if (!profile?.email || profile.user_type !== "photographer") return { ok: false as const };

      const firstName = (profile.full_name ?? "").trim().split(" ")[0] || "there";
      await sendEmail(
        profile.email,
        "Welcome to LensHive! Complete your profile to start getting clients",
        welcomePhotographerHTML({ name: firstName }),
      );
      return { ok: true as const };
    } catch (err) {
      console.error("[notifications] notifyWelcomePhotographer error:", err);
      return { ok: false as const };
    }
  });

/**
 * Booking confirmation: sent when the photographer accepts an enquiry.
 * Only the photographer who owns the enquiry may trigger it; all recipient
 * data is resolved server-side from the enquiry id.
 */
export const notifyBookingConfirmed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ enquiryId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: enquiry } = await supabaseAdmin
        .from("enquiries")
        .select(
          "id, photographer_id, client_name, client_email, client_phone, shoot_date, shoot_type, booking_type, location, status",
        )
        .eq("id", data.enquiryId)
        .maybeSingle();
      if (!enquiry) return { ok: false as const };

      const { data: photographer } = await supabaseAdmin
        .from("photographer_profiles")
        .select("id, user_id")
        .eq("id", enquiry.photographer_id)
        .maybeSingle();
      // Only the owning photographer may send a confirmation for this enquiry.
      if (!photographer || photographer.user_id !== context.userId) return { ok: false as const };

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name, phone")
        .eq("id", photographer.user_id)
        .maybeSingle();

      const photographerName = profile?.full_name ?? "your photographer";
      const base = {
        clientName: enquiry.client_name,
        photographerName,
        photographerEmail: profile?.email ?? null,
        photographerPhone: profile?.phone ?? null,
        shootDate: enquiry.shoot_date,
        shootType: enquiry.shoot_type,
        bookingType: enquiry.booking_type,
        location: enquiry.location,
        photographerId: enquiry.photographer_id,
      };

      await Promise.all([
        sendEmail(
          enquiry.client_email,
          `Booking confirmed with ${photographerName} — LensHive`,
          bookingConfirmedClientHTML(base),
        ),
        profile?.email
          ? sendEmail(
              profile.email,
              `You confirmed the booking with ${enquiry.client_name} — LensHive`,
              bookingConfirmedPhotographerHTML({
                ...base,
                clientEmail: enquiry.client_email,
                clientPhone: enquiry.client_phone,
              }),
            )
          : Promise.resolve(),
      ]);

      return { ok: true as const };
    } catch (err) {
      console.error("[notifications] notifyBookingConfirmed error:", err);
      return { ok: false as const };
    }
  });
