import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  photographerId: string;
  photographerName: string;
}

const SHOOT_TYPES = ["Wedding", "Engagement", "Reels & Content", "Brand Shoot", "Events", "Portrait", "Product", "Travel", "Other"];
const BOOKING_TYPES = ["Hourly", "Half day (4 hrs)", "Full day (8 hrs)", "Custom project"];

export function ContactModal({ open, onClose, photographerId, photographerName }: ContactModalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shootDate: "",
    shootType: "",
    bookingType: "",
    location: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(key: K, v: string) {
    setForm((f) => ({ ...f, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name (min 2 chars)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (!form.shootDate) e.shootDate = "Pick a shoot date";
    else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(form.shootDate) < today) e.shootDate = "Date must be today or later";
    }
    if (!form.shootType) e.shootType = "Select a shoot type";
    if (!form.bookingType) e.bookingType = "Select a booking type";
    if (form.message.trim().length < 20) e.message = "Message must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.from("enquiries").insert({
      photographer_id: photographerId,
      client_name: form.name.trim(),
      client_email: form.email.trim(),
      client_phone: form.phone.trim() || null,
      shoot_date: form.shootDate || null,
      shoot_type: form.shootType || null,
      booking_type: form.bookingType || null,
      location: form.location.trim() || null,
      message: form.message.trim(),
      client_id: user?.id || null,
      status: "unread",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Could not send enquiry. Please try again.");
      return;
    }
    toast.success("Enquiry sent! They'll reply within 24 hours.");
    setForm({ name: "", email: "", phone: "", shootDate: "", shootType: "", bookingType: "", location: "", message: "" });
    setErrors({});
    onClose();
  }

  const today = new Date().toISOString().split("T")[0];
  const inputCls = "w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-honey/40 focus:border-honey";
  const labelCls = "block text-xs font-medium text-muted-ink mb-1.5";
  const errCls = "text-xs text-red-600 mt-1";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-dark">Send an enquiry</DialogTitle>
          <DialogDescription>Tell {photographerName} about your shoot. They'll reply within 24 hours.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Your name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => update("name", e.target.value)} />
              {errors.name && <p className={errCls}>{errors.name}</p>}
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} />
              {errors.email && <p className={errCls}>{errors.email}</p>}
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Shoot date *</label>
              <input type="date" min={today} className={inputCls} value={form.shootDate} onChange={(e) => update("shootDate", e.target.value)} />
              {errors.shootDate && <p className={errCls}>{errors.shootDate}</p>}
            </div>
            <div>
              <label className={labelCls}>Type of shoot *</label>
              <select className={inputCls} value={form.shootType} onChange={(e) => update("shootType", e.target.value)}>
                <option value="">Select…</option>
                {SHOOT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.shootType && <p className={errCls}>{errors.shootType}</p>}
            </div>
            <div>
              <label className={labelCls}>Booking type *</label>
              <select className={inputCls} value={form.bookingType} onChange={(e) => update("bookingType", e.target.value)}>
                <option value="">Select…</option>
                {BOOKING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.bookingType && <p className={errCls}>{errors.bookingType}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Location / city</label>
            <input className={inputCls} value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Message *</label>
            <textarea rows={5} className={inputCls} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Share details about your shoot, vision, and any specific requirements…" />
            <div className="flex justify-between mt-1">
              {errors.message ? <p className={errCls}>{errors.message}</p> : <span />}
              <span className="text-xs text-muted-ink">{form.message.length} chars</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-ink hover:text-dark">Cancel</button>
            <button type="submit" disabled={submitting} className="bg-honey text-dark px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber transition disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? "Sending…" : "Send enquiry"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
