// Email templates for LensHive notifications (server-side only usage).
const SITE = "https://lenshive.lovable.app";

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SHELL_STYLE = `
body{font-family:sans-serif;background:#FDF8F0;margin:0;padding:24px}
.card{background:#fff;border-radius:12px;padding:28px;max-width:540px;margin:0 auto;border:1px solid #EDE4D3}
.logo{font-size:20px;font-weight:700;color:#1A1208;margin-bottom:20px}
.logo span{color:#F5A623}
h2{font-size:20px;color:#1A1208;margin:0 0 6px}
p{color:#6B5E4A;font-size:14px;line-height:1.6;margin:0 0 16px}
.detail{padding:8px 0;border-bottom:1px solid #EDE4D3;font-size:13px}
.dl{color:#A8957E;font-weight:600;display:inline-block;min-width:110px}
.dv{color:#2D2416}
.msg{background:#FDF8F0;border-radius:8px;padding:14px;margin:16px 0;color:#2D2416;font-size:14px;line-height:1.7;font-style:italic}
.box{background:#FEF3C7;border-radius:8px;padding:14px;margin:14px 0;color:#92400E;font-size:13px;line-height:1.6}
.step{margin:10px 0;font-size:13px;color:#2D2416}
.btn{display:inline-block;background:#F5A623;color:#1A1208;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:16px}
.footer{margin-top:20px;font-size:12px;color:#A8957E;text-align:center}
`;

function shell(inner: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${SHELL_STYLE}</style></head><body><div class="card"><div class="logo">Lens<span>Hive</span></div>${inner}</div></body></html>`;
}

function row(label: string, value?: string | null) {
  return value ? `<div class="detail"><span class="dl">${esc(label)}</span><span class="dv">${esc(value)}</span></div>` : "";
}

export interface EnquiryEmailData {
  photographerName: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  shootDate?: string | null;
  shootType?: string | null;
  bookingType?: string | null;
  location?: string | null;
  message: string;
}

export function enquiryToPhotographerHTML(d: EnquiryEmailData) {
  return shell(`
<h2>New enquiry from ${esc(d.clientName)} 📸</h2>
<p>You have a new booking enquiry. Reply fast — photographers who respond within 2 hours get 3× more bookings!</p>
${row("Phone", d.clientPhone)}
${row("Email", d.clientEmail)}
${row("Shoot date", d.shootDate)}
${row("Shoot type", d.shootType)}
${row("Booking type", d.bookingType)}
${row("Location", d.location)}
<div class="msg">"${esc(d.message)}"</div>
<a href="${SITE}/dashboard" class="btn">View in dashboard →</a>
<div class="footer">LensHive · India's photographer marketplace<br>You're receiving this because a client contacted you.</div>`);
}

export function clientConfirmationHTML(d: {
  clientName: string;
  photographerName: string;
  shootDate?: string | null;
  photographerId: string;
}) {
  return shell(`
<h2>Enquiry sent to ${esc(d.photographerName)}! ✅</h2>
<p>Hi ${esc(d.clientName)}, your enquiry has been sent. They'll get back to you within 24 hours.</p>
<div class="box"><strong>What happens next?</strong><br/>
${esc(d.photographerName)} will review your message and reply directly to your email.
${d.shootDate ? `Your requested shoot date is <strong>${esc(d.shootDate)}</strong>.` : ""}</div>
<p>You can also contact them directly on WhatsApp from their profile page.</p>
<a href="${SITE}/photographers/${esc(d.photographerId)}" class="btn">View photographer profile →</a>
<div class="footer">LensHive · India's photographer marketplace</div>`);
}

export interface BookingConfirmedData {
  clientName: string;
  photographerName: string;
  photographerEmail?: string | null;
  photographerPhone?: string | null;
  shootDate?: string | null;
  shootType?: string | null;
  bookingType?: string | null;
  location?: string | null;
  photographerId: string;
}

/** Sent to the client when the photographer accepts the enquiry. */
export function bookingConfirmedClientHTML(d: BookingConfirmedData) {
  return shell(`
<h2>Your shoot with ${esc(d.photographerName)} is confirmed! 🎉</h2>
<p>Hi ${esc(d.clientName)}, good news — ${esc(d.photographerName)} has accepted your booking enquiry.</p>
${row("Shoot date", d.shootDate)}
${row("Shoot type", d.shootType)}
${row("Booking type", d.bookingType)}
${row("Location", d.location)}
${row("Photographer email", d.photographerEmail)}
${row("Photographer phone", d.photographerPhone)}
<div class="box"><strong>What happens next?</strong><br/>
${esc(d.photographerName)} will contact you directly to finalise timings, deliverables and payment.</div>
<a href="${SITE}/photographers/${esc(d.photographerId)}" class="btn">View photographer profile →</a>
<div class="footer">LensHive · India's photographer marketplace</div>`);
}

/** Copy of the confirmation sent to the photographer for their records. */
export function bookingConfirmedPhotographerHTML(
  d: BookingConfirmedData & { clientEmail: string; clientPhone?: string | null },
) {
  return shell(`
<h2>Booking confirmed with ${esc(d.clientName)} ✅</h2>
<p>You accepted this enquiry. We've let ${esc(d.clientName)} know the shoot is confirmed.</p>
${row("Client email", d.clientEmail)}
${row("Client phone", d.clientPhone)}
${row("Shoot date", d.shootDate)}
${row("Shoot type", d.shootType)}
${row("Booking type", d.bookingType)}
${row("Location", d.location)}
<a href="${SITE}/dashboard" class="btn">Open your dashboard →</a>
<div class="footer">LensHive · India's photographer marketplace</div>`);
}

export function welcomePhotographerHTML(d: { name: string }) {
  return shell(`
<h2>Welcome to LensHive, ${esc(d.name)}! 🎉</h2>
<p>Complete your profile in 3 steps to start getting client enquiries:</p>
<div class="step"><strong>1. Upload 6+ portfolio photos</strong> — profiles with photos get 8× more enquiries</div>
<div class="step"><strong>2. Set your pricing</strong> — hourly, half-day, and full-day rates</div>
<div class="step"><strong>3. Publish your profile</strong> — you'll go live and clients can find you instantly</div>
<a href="${SITE}/dashboard" class="btn">Complete your profile →</a>
<div class="footer">LensHive · India's photographer marketplace</div>`);
}
