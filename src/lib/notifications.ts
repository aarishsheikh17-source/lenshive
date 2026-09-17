import {
  notifyBookingConfirmed,
  notifyEnquiry,
  notifyWelcomePhotographer,
} from "./notifications.functions";

/** Fire-and-forget: booking confirmation to the client (and copy to photographer). */
export async function sendBookingConfirmation(enquiryId: string) {
  try {
    await notifyBookingConfirmed({ data: { enquiryId } });
  } catch (err) {
    console.error("Booking confirmation error:", err);
  }
}

/** Fire-and-forget: never throws, never blocks the user flow. */
export async function sendEnquiryNotifications(enquiryId: string) {
  try {
    await notifyEnquiry({ data: { enquiryId } });
  } catch (err) {
    console.error("Notification error:", err);
  }
}

/** Fire-and-forget welcome email for a new photographer account. */
export async function sendWelcomeEmail(userId: string) {
  try {
    await notifyWelcomePhotographer({ data: { userId } });
  } catch (err) {
    console.error("Welcome email error:", err);
  }
}
