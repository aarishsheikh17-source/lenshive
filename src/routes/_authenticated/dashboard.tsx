import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Home,
  MessageSquare,
  Camera,
  DollarSign,
  Edit,
  Heart,
  X,
  Upload,
  Loader2,
  ExternalLink,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatDate } from "@/lib/utils-app";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — LensHive" }, { name: "robots", content: "noindex" }],
  }),
  component: DashboardPage,
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type UserType = "client" | "photographer";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  user_type: UserType | string | null;
};

type PhotographerRow = {
  id: string;
  user_id: string;
  bio: string | null;
  years_experience: string | null;
  instagram_handle: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  specializations: string[];
  is_available: boolean;
  available_for_travel: boolean;
  city: string | null;
  country: string | null;
  profile_views: number;
  is_published: boolean;
};

type EnquiryRow = {
  id: string;
  photographer_id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  shoot_date: string | null;
  shoot_type: string | null;
  booking_type: string | null;
  location: string | null;
  message: string;
  status: string;
  created_at: string;
};

type PortfolioItem = {
  id: string;
  photographer_id: string;
  storage_path: string;
  public_url: string;
  caption: string | null;
  display_order: number;
};

type PricingRow = {
  photographer_id: string;
  currency: string;
  hourly_rate: number | null;
  half_day_rate: number | null;
  full_day_rate: number | null;
  custom_project_available: boolean;
  custom_project_note: string | null;
};

const SPECIALTY_OPTIONS = [
  "Wedding", "Reels", "Events", "Brand", "Portrait", "Product",
  "Travel", "Architecture", "Fashion", "Corporate", "Food", "Automotive",
];

const CURRENCIES = ["₹", "AED", "£", "$"];
const EXPERIENCE_OPTIONS = ["<1yr", "1-2yrs", "3-5yrs", "5-10yrs", "10+yrs"];

type PhotogSection = "overview" | "messages" | "portfolio" | "pricing" | "profile";
type ClientSection = "overview" | "enquiries" | "saved";

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [photog, setPhotog] = useState<PhotographerRow | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [section, setSection] = useState<PhotogSection | ClientSection>("overview");

  const isPhotographer = profile?.user_type === "photographer";

  const reloadUnread = useCallback(async (photographerId: string) => {
    const { count } = await supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("photographer_id", photographerId)
      .eq("status", "unread");
    setUnreadCount(count ?? 0);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);
    setEmail(user.email ?? "");

    const { data: prof } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, user_type")
      .eq("id", user.id)
      .maybeSingle();
    setProfile((prof as ProfileRow) ?? { id: user.id, full_name: null, email: user.email ?? null, phone: null, user_type: "client" });

    if (prof?.user_type === "photographer") {
      const { data: p } = await supabase
        .from("photographer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (p) {
        setPhotog(p as PhotographerRow);
        await reloadUnread(p.id);
      }
    }
    setLoading(false);
  }, [reloadUnread]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const photogNav = [
    { id: "overview" as const, label: "Overview", icon: Home },
    { id: "messages" as const, label: "Messages", icon: MessageSquare, badge: unreadCount },
    { id: "portfolio" as const, label: "Portfolio", icon: Camera },
    { id: "pricing" as const, label: "Pricing", icon: DollarSign },
    { id: "profile" as const, label: "Edit Profile", icon: Edit },
  ];
  const clientNav = [
    { id: "overview" as const, label: "Overview", icon: Home },
    { id: "enquiries" as const, label: "My Enquiries", icon: MessageSquare },
    { id: "saved" as const, label: "Saved", icon: Heart },
  ];
  const nav = isPhotographer ? photogNav : clientNav;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="h-40 rounded-xl bg-white/60 animate-pulse" />
        ) : (
          <>
            {/* mobile tab strip */}
            <div className="md:hidden -mx-4 px-4 mb-4 overflow-x-auto">
              <div className="flex gap-2 whitespace-nowrap">
                {nav.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSection(n.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border ${
                      section === n.id ? "bg-dark text-white border-dark" : "bg-white text-ink border-border"
                    }`}
                  >
                    <n.icon className="size-4" />
                    {n.label}
                    {"badge" in n && n.badge ? (
                      <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{n.badge}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              {/* sidebar */}
              <aside className="hidden md:block w-60 shrink-0">
                <div className="rounded-xl border border-border bg-white p-3 sticky top-6">
                  <div className="px-2 pb-3 border-b border-border/60">
                    <div className="text-sm font-semibold text-dark truncate">{profile?.full_name || "Your account"}</div>
                    <div className="text-xs text-ink/60 truncate">{email}</div>
                    <div className="text-[10px] uppercase tracking-wide text-ink/50 mt-1">
                      {isPhotographer ? "Photographer" : "Client"}
                    </div>
                  </div>
                  <nav className="mt-2 space-y-1">
                    {nav.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setSection(n.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          section === n.id ? "bg-honey/20 text-dark" : "text-ink hover:bg-cream"
                        }`}
                      >
                        <n.icon className="size-4" />
                        <span className="flex-1 text-left">{n.label}</span>
                        {"badge" in n && n.badge ? (
                          <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{n.badge}</span>
                        ) : null}
                      </button>
                    ))}
                  </nav>
                  <button onClick={signOut} className="mt-3 w-full text-xs text-ink/60 hover:text-dark text-left px-3 py-2">
                    Sign out
                  </button>
                </div>
              </aside>

              <section className="flex-1 min-w-0">
                {isPhotographer && photog ? (
                  <PhotogSections
                    section={section as PhotogSection}
                    userId={userId}
                    profile={profile!}
                    photog={photog}
                    onPhotogUpdate={setPhotog}
                    onProfileUpdate={setProfile}
                    onUnreadRefresh={() => reloadUnread(photog.id)}
                    goSection={(s) => setSection(s)}
                  />
                ) : (
                  <ClientSections
                    section={section as ClientSection}
                    email={email}
                    userId={userId}
                    profile={profile!}
                  />
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Photographer sections
// -----------------------------------------------------------------------------

function PhotogSections({
  section, userId, profile, photog, onPhotogUpdate, onProfileUpdate, onUnreadRefresh, goSection,
}: {
  section: PhotogSection;
  userId: string;
  profile: ProfileRow;
  photog: PhotographerRow;
  onPhotogUpdate: (p: PhotographerRow) => void;
  onProfileUpdate: (p: ProfileRow) => void;
  onUnreadRefresh: () => void;
  goSection: (s: PhotogSection) => void;
}) {
  if (section === "overview")
    return <PhotogOverview profile={profile} photog={photog} onPhotogUpdate={onPhotogUpdate} goSection={goSection} />;
  if (section === "messages") return <MessagesSection photog={photog} onUnreadRefresh={onUnreadRefresh} />;
  if (section === "portfolio") return <PortfolioSection userId={userId} photog={photog} />;
  if (section === "pricing") return <PricingSection photog={photog} />;
  if (section === "profile") return <EditProfileSection profile={profile} photog={photog} onPhotogUpdate={onPhotogUpdate} onProfileUpdate={onProfileUpdate} />;
  return null;
}

function PhotogOverview({
  profile, photog, onPhotogUpdate, goSection,
}: {
  profile: ProfileRow;
  photog: PhotographerRow;
  onPhotogUpdate: (p: PhotographerRow) => void;
  goSection: (s: PhotogSection) => void;
}) {
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [portCount, setPortCount] = useState(0);
  const [totalEnq, setTotalEnq] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: eq, count: eqCount }, { count: unreadC }, { count: pc }] = await Promise.all([
        supabase.from("enquiries").select("*", { count: "exact" }).eq("photographer_id", photog.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("photographer_id", photog.id).eq("status", "unread"),
        supabase.from("portfolio_items").select("id", { count: "exact", head: true }).eq("photographer_id", photog.id),
      ]);
      setEnquiries((eq as EnquiryRow[]) ?? []);
      setTotalEnq(eqCount ?? 0);
      setUnread(unreadC ?? 0);
      setPortCount(pc ?? 0);
    })();
  }, [photog.id]);

  async function toggleAvailability() {
    setSaving(true);
    const next = !photog.is_available;
    const { error } = await supabase.from("photographer_profiles").update({ is_available: next }).eq("id", photog.id);
    setSaving(false);
    if (error) { toast.error("Could not update availability"); return; }
    onPhotogUpdate({ ...photog, is_available: next });
    toast.success(next ? "You're now marked available" : "You're now marked unavailable");
  }

  const firstName = (profile.full_name ?? "").split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl sm:text-4xl text-dark">Welcome back, {firstName}!</h1>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <MetricCard label="Profile Views" value={photog.profile_views} />
        <MetricCard label="Total Enquiries" value={totalEnq} />
        <MetricCard label="Unread Messages" value={unread} highlight={unread > 0} />
        <MetricCard label="Portfolio Items" value={portCount} />
      </div>

      <div className="rounded-xl border border-border bg-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-dark">Availability</div>
          <div className="text-xs text-ink/60 mt-0.5">
            {photog.is_available ? "You're accepting new bookings" : "You're not accepting bookings right now"}
          </div>
        </div>
        <button
          onClick={toggleAvailability}
          disabled={saving}
          className={`relative w-16 h-9 rounded-full transition ${photog.is_available ? "bg-emerald-500" : "bg-slate-300"} disabled:opacity-60`}
          aria-label="Toggle availability"
        >
          <span className={`absolute top-1 left-1 size-7 rounded-full bg-white shadow transition-transform ${photog.is_available ? "translate-x-7" : ""}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/photographers/$id" params={{ id: photog.id }} className="inline-flex items-center gap-1.5 text-sm font-medium text-dark hover:text-honey">
          View your public profile <ExternalLink className="size-4" />
        </Link>
        {!photog.is_published && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Not published yet — publish from Edit Profile</span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-xl text-dark">Recent enquiries</h3>
          <button onClick={() => goSection("messages")} className="text-sm text-ink/70 hover:text-dark">See all →</button>
        </div>
        {enquiries.length === 0 ? (
          <p className="text-sm text-ink/60">No enquiries yet. Share your profile to get discovered.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {enquiries.map((e) => (
              <li key={e.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-dark truncate">{e.client_name} · <span className="text-ink/60">{e.shoot_type ?? "—"}</span></div>
                  <div className="text-xs text-ink/60 truncate">{e.message}</div>
                </div>
                <div className="text-xs text-ink/50 shrink-0">{formatDate(e.created_at)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${highlight ? "bg-red-50 border-red-200" : "bg-white border-border"}`}>
      <div className="text-xs uppercase tracking-wide text-ink/60">{label}</div>
      <div className="mt-1 font-serif text-3xl text-dark">{value}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Messages
// -----------------------------------------------------------------------------

function MessagesSection({ photog, onUnreadRefresh }: { photog: PhotographerRow; onUnreadRefresh: () => void }) {
  const [rows, setRows] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .eq("photographer_id", photog.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data as EnquiryRow[]) ?? []);
    setLoading(false);
  }, [photog.id]);

  useEffect(() => { load(); }, [load]);

  async function markRead(id: string) {
    const { error } = await supabase.from("enquiries").update({ status: "read" }).eq("id", id);
    if (error) { toast.error("Could not update"); return; }
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: "read" } : x)));
    onUnreadRefresh();
    toast.success("Marked as read");
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl text-dark">Messages</h1>
      {loading ? (
        <div className="h-32 bg-white/60 rounded-xl animate-pulse" />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center text-ink/60">No enquiries yet.</div>
      ) : (
        <ul className="space-y-3">
          {rows.map((e) => {
            const unread = e.status === "unread";
            return (
              <li key={e.id} className={`rounded-xl border border-border bg-white p-5 ${unread ? "border-l-4 border-l-amber" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-dark">{e.client_name}</div>
                    <div className="text-xs text-ink/60 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="inline-flex items-center gap-1"><Mail className="size-3" />{e.client_email}</span>
                      {e.client_phone && <span className="inline-flex items-center gap-1"><Phone className="size-3" />{e.client_phone}</span>}
                      {e.shoot_date && <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{formatDate(e.shoot_date)}</span>}
                      {e.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{e.location}</span>}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {e.shoot_type && <span className="text-[11px] bg-honey/20 text-dark px-2 py-0.5 rounded-full">{e.shoot_type}</span>}
                      {e.booking_type && <span className="text-[11px] bg-cream text-ink px-2 py-0.5 rounded-full border border-border">{e.booking_type}</span>}
                      {unread && <span className="text-[11px] bg-red-500 text-white px-2 py-0.5 rounded-full">Unread</span>}
                    </div>
                  </div>
                  <div className="text-xs text-ink/50">{formatDate(e.created_at)}</div>
                </div>
                <p className="mt-3 text-sm text-ink whitespace-pre-wrap">{e.message}</p>
                {unread && (
                  <div className="mt-3">
                    <button onClick={() => markRead(e.id)} className="inline-flex items-center gap-1.5 text-xs font-medium bg-dark text-white px-3 py-1.5 rounded-lg hover:bg-ink">
                      <Check className="size-3" /> Mark as read
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Portfolio
// -----------------------------------------------------------------------------

function PortfolioSection({ userId, photog }: { userId: string; photog: PhotographerRow }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("photographer_id", photog.id)
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    else setItems((data as PortfolioItem[]) ?? []);
    setLoading(false);
  }, [photog.id]);

  useEffect(() => { load(); }, [load]);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) { toast.error("Only images allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from("portfolios").upload(path, file, {
      cacheControl: "3600", upsert: false, contentType: file.type,
    });
    if (upErr) {
      setUploading(false); toast.error(upErr.message); return;
    }

    // private bucket → use long-lived signed URL
    const { data: signed, error: signErr } = await supabase.storage.from("portfolios").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr || !signed) {
      setUploading(false); toast.error("Could not create URL"); return;
    }

    const maxOrder = items.reduce((m, i) => Math.max(m, i.display_order), 0);
    const { error: insErr } = await supabase.from("portfolio_items").insert({
      photographer_id: photog.id,
      storage_path: path,
      public_url: signed.signedUrl,
      display_order: maxOrder + 1,
    });
    setUploading(false);
    if (insErr) { toast.error(insErr.message); return; }
    toast.success("Photo added");
    load();
  }

  async function remove(item: PortfolioItem) {
    if (!confirm("Delete this photo?")) return;
    const { error } = await supabase.from("portfolio_items").delete().eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    // Best-effort remove from storage (skip if external URL)
    if (item.storage_path && !item.storage_path.startsWith("seed/")) {
      await supabase.storage.from("portfolios").remove([item.storage_path]);
    }
    setItems((r) => r.filter((x) => x.id !== item.id));
    toast.success("Deleted");
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl text-dark">Portfolio</h1>
      {loading ? (
        <div className="h-40 bg-white/60 rounded-xl animate-pulse" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((it) => (
            <div key={it.id} className="relative group aspect-square rounded-lg overflow-hidden bg-cream border border-border">
              <img src={it.public_url} alt={it.caption ?? "Portfolio"} className="w-full h-full object-cover" loading="lazy" />
              <button
                onClick={() => remove(it)}
                className="absolute top-2 right-2 size-8 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-red-600"
                aria-label="Delete photo"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            className={`aspect-square rounded-lg border-2 border-dashed border-border bg-white flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:border-honey hover:bg-honey/5 transition ${uploading ? "pointer-events-none opacity-70" : ""}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-honey" />
            ) : (
              <>
                <Upload className="size-6 text-ink/60" />
                <div className="text-xs mt-2 text-ink/70">Click or drag to upload</div>
                <div className="text-[10px] text-ink/50 mt-0.5">Images · max 5MB</div>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Pricing
// -----------------------------------------------------------------------------

function PricingSection({ photog }: { photog: PhotographerRow }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState<PricingRow>({
    photographer_id: photog.id,
    currency: "₹",
    hourly_rate: null,
    half_day_rate: null,
    full_day_rate: null,
    custom_project_available: true,
    custom_project_note: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("pricing").select("*").eq("photographer_id", photog.id).maybeSingle();
      if (data) setRow(data as PricingRow);
      setLoading(false);
    })();
  }, [photog.id]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("pricing").upsert({
      photographer_id: photog.id,
      currency: row.currency,
      hourly_rate: row.hourly_rate,
      half_day_rate: row.half_day_rate,
      full_day_rate: row.full_day_rate,
      custom_project_available: row.custom_project_available,
      custom_project_note: row.custom_project_note,
    }, { onConflict: "photographer_id" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Pricing saved");
  }

  const inp = "w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-honey/40 focus:border-honey";

  if (loading) return <div className="h-40 bg-white/60 rounded-xl animate-pulse" />;

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="font-serif text-3xl text-dark">Pricing</h1>
      <div className="rounded-xl border border-border bg-white p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink/70 mb-1.5">Currency</label>
          <select className={inp} value={row.currency} onChange={(e) => setRow({ ...row, currency: e.target.value })}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <RateInput label={`Hourly rate (${row.currency})`} value={row.hourly_rate} onChange={(v) => setRow({ ...row, hourly_rate: v })} />
        <RateInput label={`Half day rate (${row.currency})`} value={row.half_day_rate} onChange={(v) => setRow({ ...row, half_day_rate: v })} />
        <RateInput label={`Full day rate (${row.currency})`} value={row.full_day_rate} onChange={(v) => setRow({ ...row, full_day_rate: v })} />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={row.custom_project_available} onChange={(e) => setRow({ ...row, custom_project_available: e.target.checked })} />
          Available for custom projects
        </label>

        {row.custom_project_available && (
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Custom project note</label>
            <textarea rows={3} className={inp} value={row.custom_project_note ?? ""} onChange={(e) => setRow({ ...row, custom_project_note: e.target.value })} placeholder="What kinds of projects, typical budget, etc." />
          </div>
        )}

        <button onClick={save} disabled={saving} className="bg-honey text-dark px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber transition disabled:opacity-60">
          {saving ? "Saving…" : "Save pricing"}
        </button>
      </div>
    </div>
  );
}

function RateInput({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink/70 mb-1.5">{label}</label>
      <input
        type="number" min={0}
        className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-honey/40 focus:border-honey"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Edit Profile
// -----------------------------------------------------------------------------

function EditProfileSection({
  profile, photog, onPhotogUpdate, onProfileUpdate,
}: {
  profile: ProfileRow;
  photog: PhotographerRow;
  onPhotogUpdate: (p: PhotographerRow) => void;
  onProfileUpdate: (p: ProfileRow) => void;
}) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    city: photog.city ?? "",
    country: photog.country ?? "",
    instagram_handle: photog.instagram_handle ?? "",
    website_url: photog.website_url ?? "",
    whatsapp_number: photog.whatsapp_number ?? "",
    bio: photog.bio ?? "",
    years_experience: photog.years_experience ?? "",
    available_for_travel: photog.available_for_travel,
    is_published: photog.is_published,
    specializations: photog.specializations ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [addSpec, setAddSpec] = useState("");

  const inp = "w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-honey/40 focus:border-honey";
  const label = "block text-xs font-medium text-ink/70 mb-1.5";

  function addSpecialty(s: string) {
    if (!s || form.specializations.includes(s)) return;
    setForm((f) => ({ ...f, specializations: [...f.specializations, s] }));
    setAddSpec("");
  }
  function removeSpecialty(s: string) {
    setForm((f) => ({ ...f, specializations: f.specializations.filter((x) => x !== s) }));
  }

  async function save() {
    if (form.bio.length > 500) { toast.error("Bio must be ≤500 chars"); return; }
    setSaving(true);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("profiles").update({
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null,
      }).eq("id", profile.id),
      supabase.from("photographer_profiles").update({
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        instagram_handle: form.instagram_handle.trim() || null,
        website_url: form.website_url.trim() || null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        bio: form.bio.trim() || null,
        years_experience: form.years_experience || null,
        available_for_travel: form.available_for_travel,
        is_published: form.is_published,
        specializations: form.specializations,
      }).eq("id", photog.id),
    ]);
    setSaving(false);
    if (e1 || e2) { toast.error(e1?.message || e2?.message || "Save failed"); return; }
    onProfileUpdate({ ...profile, full_name: form.full_name, phone: form.phone });
    onPhotogUpdate({
      ...photog,
      city: form.city, country: form.country, instagram_handle: form.instagram_handle,
      website_url: form.website_url, whatsapp_number: form.whatsapp_number, bio: form.bio,
      years_experience: form.years_experience, available_for_travel: form.available_for_travel,
      is_published: form.is_published, specializations: form.specializations,
    });
    toast.success("Profile saved");
  }

  const remaining = 500 - form.bio.length;
  const availableToAdd = useMemo(() => SPECIALTY_OPTIONS.filter((s) => !form.specializations.includes(s)), [form.specializations]);

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="font-serif text-3xl text-dark">Edit Profile</h1>

      <div className="rounded-xl border border-border bg-white p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-dark">Publish profile</div>
          <div className="text-xs text-ink/60">When on, your profile appears in Browse and search.</div>
        </div>
        <button
          onClick={() => setForm({ ...form, is_published: !form.is_published })}
          className={`relative w-14 h-8 rounded-full transition ${form.is_published ? "bg-emerald-500" : "bg-slate-300"}`}
          aria-label="Toggle publish"
        >
          <span className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform ${form.is_published ? "translate-x-6" : ""}`} />
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name"><input className={inp} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
          <Field label="Phone"><input className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="City"><input className={inp} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Country"><input className={inp} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <Field label="Instagram handle"><input className={inp} placeholder="@yourhandle" value={form.instagram_handle} onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })} /></Field>
          <Field label="Website"><input className={inp} placeholder="https://…" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></Field>
          <Field label="WhatsApp"><input className={inp} value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} /></Field>
          <Field label="Years experience">
            <select className={inp} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })}>
              <option value="">Select…</option>
              {EXPERIENCE_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
        </div>

        <div>
          <label className={label}>Bio <span className="text-ink/50 float-right">{remaining} chars left</span></label>
          <textarea rows={5} className={inp} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 500) })} />
        </div>

        <div>
          <label className={label}>Specializations</label>
          <div className="flex flex-wrap gap-2">
            {form.specializations.map((s) => (
              <button key={s} type="button" onClick={() => removeSpecialty(s)} className="inline-flex items-center gap-1 text-xs bg-honey/20 text-dark px-2.5 py-1 rounded-full hover:bg-red-100 hover:text-red-700">
                {s} <X className="size-3" />
              </button>
            ))}
          </div>
          {availableToAdd.length > 0 && (
            <div className="mt-2 flex gap-2">
              <select className={inp} value={addSpec} onChange={(e) => setAddSpec(e.target.value)}>
                <option value="">Add specialty…</option>
                {availableToAdd.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <button type="button" onClick={() => addSpecialty(addSpec)} className="px-3 py-2 text-sm bg-dark text-white rounded-lg hover:bg-ink">Add</button>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.available_for_travel} onChange={(e) => setForm({ ...form, available_for_travel: e.target.checked })} />
          Available for travel
        </label>

        <button onClick={save} disabled={saving} className="bg-honey text-dark px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber transition disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink/70 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Client sections
// -----------------------------------------------------------------------------

function ClientSections({ section, email, userId, profile }: { section: ClientSection; email: string; userId: string; profile: ProfileRow }) {
  if (section === "overview") return <ClientOverview profile={profile} email={email} userId={userId} />;
  if (section === "enquiries") return <ClientEnquiries email={email} />;
  if (section === "saved") return <ClientSaved userId={userId} />;
  return null;
}

function ClientOverview({ profile, email, userId }: { profile: ProfileRow; email: string; userId: string }) {
  const [enqCount, setEnqCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ count: e }, { count: s }] = await Promise.all([
        supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("client_email", email),
        supabase.from("saved_photographers").select("id", { count: "exact", head: true }).eq("client_id", userId),
      ]);
      setEnqCount(e ?? 0);
      setSavedCount(s ?? 0);
    })();
  }, [email, userId]);

  const firstName = (profile.full_name ?? "").split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl sm:text-4xl text-dark">Welcome back, {firstName}!</h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <MetricCard label="Enquiries Sent" value={enqCount} />
        <MetricCard label="Saved Photographers" value={savedCount} />
      </div>
      <Link to="/browse" className="inline-block bg-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-ink">
        Browse photographers →
      </Link>
    </div>
  );
}

function ClientEnquiries({ email }: { email: string }) {
  const [rows, setRows] = useState<Array<EnquiryRow & { photographer: { profile: { full_name: string | null } | null } | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select(`*, photographer:photographer_profiles!enquiries_photographer_id_fkey ( profile:profiles!photographer_profiles_user_id_fkey ( full_name ) )`)
        .eq("client_email", email)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, [email]);

  const statusColor: Record<string, string> = {
    unread: "bg-amber-100 text-amber-800",
    read: "bg-blue-100 text-blue-800",
    replied: "bg-emerald-100 text-emerald-800",
    closed: "bg-slate-200 text-slate-700",
  };

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl text-dark">My Enquiries</h1>
      {loading ? <div className="h-32 bg-white/60 rounded-xl animate-pulse" /> :
        rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center text-ink/60">You haven't sent any enquiries yet.</div>
        ) : (
          <ul className="space-y-3">
            {rows.map((e) => (
              <li key={e.id} className="rounded-xl border border-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-dark">{e.photographer?.profile?.full_name ?? "Photographer"}</div>
                    <div className="text-xs text-ink/60 mt-0.5">
                      {e.shoot_type ?? "—"} · {e.shoot_date ? formatDate(e.shoot_date) : "No date"}
                    </div>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusColor[e.status] ?? "bg-slate-100 text-slate-700"}`}>{e.status}</span>
                </div>
                <p className="mt-2 text-sm text-ink/80 line-clamp-2">{e.message}</p>
                <div className="text-xs text-ink/50 mt-2">{formatDate(e.created_at)}</div>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

function ClientSaved({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Array<{ id: string; photographer_id: string; photographer: { id: string; city: string | null; rating: number; profile: { full_name: string | null; avatar_url: string | null } | null } | null }>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_photographers")
      .select(`id, photographer_id, photographer:photographer_profiles!saved_photographers_photographer_id_fkey ( id, city, rating, profile:profiles!photographer_profiles_user_id_fkey ( full_name, avatar_url ) )`)
      .eq("client_id", userId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data as any) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function unsave(id: string) {
    const { error } = await supabase.from("saved_photographers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Removed");
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl text-dark">Saved photographers</h1>
      {loading ? <div className="h-32 bg-white/60 rounded-xl animate-pulse" /> :
        rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center text-ink/60">
            No saved photographers yet. <Link to="/browse" className="text-honey underline">Browse now →</Link>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-white p-4 flex items-center gap-3">
                {r.photographer?.profile?.avatar_url ? (
                  <img src={r.photographer.profile.avatar_url} className="size-12 rounded-full object-cover" alt="" />
                ) : (
                  <div className="size-12 rounded-full bg-honey/20" />
                )}
                <div className="flex-1 min-w-0">
                  <Link to="/photographers/$id" params={{ id: r.photographer_id }} className="font-medium text-dark hover:text-honey truncate block">
                    {r.photographer?.profile?.full_name ?? "Photographer"}
                  </Link>
                  <div className="text-xs text-ink/60">{r.photographer?.city ?? "—"} · ★ {r.photographer?.rating ?? 0}</div>
                </div>
                <button onClick={() => unsave(r.id)} className="text-xs text-ink/60 hover:text-red-600" aria-label="Unsave">
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
