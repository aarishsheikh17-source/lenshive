export function initials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

export function formatPrice(amount: number | null | undefined, currency: string = "₹"): string {
  if (amount == null) return "—";
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
  return `${currency}${formatted}`;
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const SPECIALTIES = [
  "Wedding",
  "Reels",
  "Events",
  "Brand",
  "Portrait",
  "Product",
  "Travel",
  "Architecture",
  "Fashion",
  "Food",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];
