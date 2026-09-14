import { notifyEnquiry, notifyWelcomePhotographer } from "./notifications.functions";

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
