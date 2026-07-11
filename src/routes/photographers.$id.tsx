import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BadgeCheck,
  MapPin,
  Check,
  Instagram,
  MessageCircle,
  Share2,
  Plane,
  Clock,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar } from "@/components/ui-app/Avatar";
import { Stars } from "@/components/ui-app/Stars";
import { getPhotographer } from "@/lib/photographers";
import { formatPrice, formatDate } from "@/lib/utils-app";
import { ContactModal } from "@/components/enquiry/ContactModal";

export const Route = createFileRoute("/photographers/$id")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.fetchQuery({
      queryKey: ["photographer", params.id],
      queryFn: () => getPhotographer(params.id),
      staleTime: 30_000,
    });
    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.data;
    if (!p) return { meta: [{ title: "Photographer — LensHive" }] };
    const name = p.profile?.full_name ?? "Photographer";
    const title = `${name} — Photographer in ${p.city ?? "—"} | LensHive`;
    const desc = (p.bio ?? `Hire ${name}, a professional photographer in ${p.city ?? ""} on LensHive.`).slice(0, 155);
    const url = `https://lenshive.lovable.app/photographers/${p.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        ...(p.portfolio[0]?.public_url
          ? [{ property: "og:image", content: p.portfolio[0].public_url }]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url,
            mainEntity: {
              "@type": "Person",
              name,
              url,
              jobTitle: "Photographer",
              description: p.bio ?? undefined,
              image: p.profile?.avatar_url ?? p.portfolio[0]?.public_url ?? undefined,
              address: {
                "@type": "PostalAddress",
                addressLocality: p.city ?? undefined,
                addressCountry: p.country ?? undefined,
              },
              knowsAbout: p.specializations,
              sameAs: [
                p.instagram_handle ? `https://instagram.com/${p.instagram_handle}` : null,
                p.website_url ?? null,
              ].filter(Boolean),
              ...(p.pricing_full?.hourly_rate
                ? {
                    makesOffer: [
                      {
                        "@type": "Offer",
                        name: "Hourly photography session",
                        price: p.pricing_full.hourly_rate,
                        priceCurrency: p.pricing_full.currency ?? "INR",
                      },
                      ...(p.pricing_full.half_day_rate
                        ? [{ "@type": "Offer", name: "Half-day photography", price: p.pricing_full.half_day_rate, priceCurrency: p.pricing_full.currency ?? "INR" }]
                        : []),
                      ...(p.pricing_full.full_day_rate
                        ? [{ "@type": "Offer", name: "Full-day photography", price: p.pricing_full.full_day_rate, priceCurrency: p.pricing_full.currency ?? "INR" }]
                        : []),
                    ],
                  }
                : {}),
              ...(p.total_reviews > 0
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: p.rating,
                      reviewCount: p.total_reviews,
                      bestRating: 5,
                      worstRating: 1,
                    },
                    review: p.reviews.slice(0, 5).map((r) => ({
                      "@type": "Review",
                      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
                      author: { "@type": "Person", name: r.client?.full_name ?? "Client" },
                      datePublished: r.created_at,
                      reviewBody: r.comment ?? undefined,
                    })),
                  }
                : {}),
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://lenshive.lovable.app/" },
              { "@type": "ListItem", position: 2, name: "Browse", item: "https://lenshive.lovable.app/browse" },
              { "@type": "ListItem", position: 3, name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["photographer", id],
    queryFn: () => getPhotographer(id),
  });
  const [tab, setTab] = useState<"hourly" | "half_day" | "full_day">("hourly");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [shared, setShared] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  if (!data) return null;
  const p = data;
  const name = p.profile?.full_name ?? "Photographer";

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  const priceFor: Record<typeof tab, number | null | undefined> = {
    hourly: p.pricing_full?.hourly_rate,
    half_day: p.pricing_full?.half_day_rate,
    full_day: p.pricing_full?.full_day_rate,
  };
  const includes: Record<typeof tab, string[]> = {
    hourly: [
      "1 hour of shooting",
      "Edited high-res images",
      "Online gallery",
      "Personal use rights",
      "Delivery within 7 days",
    ],
    half_day: [
      "4 hours of shooting",
      "Up to 2 locations",
      "Edited high-res images",
      "Online gallery",
      "Delivery within 10 days",
    ],
    full_day: [
      "8 hours of shooting",
      "Multiple locations",
      "Edited high-res images",
      "Online gallery + sneak peek",
      "Delivery within 14 days",
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 w-full">
        <Link to="/browse" className="inline-flex items-center text-sm text-muted-ink hover:text-dark gap-1">
          <ArrowLeft size={14} /> Back to browse
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 w-full">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar name={name} src={p.profile?.avatar_url} size={96} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl sm:text-4xl text-dark">{name}</h1>
              {p.profile?.is_verified && (
                <span className="inline-flex items-center gap-1 bg-success/10 text-success text-xs font-medium px-2.5 py-1 rounded-full">
                  <BadgeCheck size={14} /> Verified
                </span>
              )}
              <span
                className={
                  "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full " +
                  (p.is_available ? "bg-success/10 text-success" : "bg-muted text-muted-ink")
                }
              >
                <span
                  className={"w-1.5 h-1.5 rounded-full " + (p.is_available ? "bg-success" : "bg-soft")}
                />
                {p.is_available ? "Available now" : "Currently busy"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-ink mt-2">
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> {p.city}{p.country ? `, ${p.country}` : ""}
              </span>
              <span className="inline-flex items-center gap-1">
                <Stars rating={p.rating} /> {p.rating.toFixed(1)} ({p.total_reviews} reviews)
              </span>
              {p.years_experience && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} /> {p.years_experience}
                </span>
              )}
              {p.available_for_travel && (
                <span className="inline-flex items-center gap-1">
                  <Plane size={14} /> Travels
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {p.specializations.map((s) => (
                <span
                  key={s}
                  className="text-xs uppercase tracking-wide font-medium text-muted-ink bg-accent px-2.5 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="bg-honey text-dark px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber transition"
            >
              Send enquiry
            </button>
            {p.whatsapp_number && (
              <a
                href={`https://wa.me/${p.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-success/10 text-success px-4 py-2.5 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
            {p.instagram_handle && (
              <a
                href={`https://instagram.com/${p.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface border border-border text-ink px-4 py-2.5 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Instagram size={16} /> Instagram
              </a>
            )}
            <button
              onClick={share}
              className="bg-surface border border-border text-ink px-4 py-2.5 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Share2 size={16} /> {shared ? "Copied!" : "Share"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="font-display text-2xl text-dark mb-4">Portfolio</h2>
            {p.portfolio.length === 0 ? (
              <p className="text-sm text-muted-ink">No portfolio items yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {p.portfolio.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setLightbox(i)}
                    className="group aspect-square overflow-hidden rounded-lg bg-accent"
                  >
                    <img
                      src={item.public_url}
                      alt={item.caption ?? `${name} photography portfolio — ${p.specializations[0] ?? "photo shoot"} in ${p.city ?? ""}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition group-hover:scale-[1.04]"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {p.bio && (
            <section>
              <h2 className="font-display text-2xl text-dark mb-3">About</h2>
              <p className="text-ink leading-relaxed whitespace-pre-line">{p.bio}</p>
            </section>
          )}

          <section>
            <h2 className="font-display text-2xl text-dark mb-4">Reviews</h2>
            <div className="bg-surface border border-border rounded-xl p-6 mb-4 flex items-center gap-6">
              <div>
                <div className="font-display text-4xl text-dark">{p.rating.toFixed(1)}</div>
                <Stars rating={p.rating} size={18} />
              </div>
              <div className="text-sm text-muted-ink">
                Based on <strong className="text-dark">{p.total_reviews}</strong> verified reviews
              </div>
            </div>
            <div className="space-y-4">
              {p.reviews.map((r) => (
                <div key={r.id} className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={r.client?.full_name ?? "Client"} size={36} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-dark">
                          {r.client?.full_name ?? "Client"}
                        </span>
                        <span className="text-xs text-muted-ink">{formatDate(r.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars rating={r.rating} />
                        {r.shoot_type && (
                          <span className="text-xs uppercase tracking-wide text-muted-ink bg-accent px-2 py-0.5 rounded-full">
                            {r.shoot_type}
                          </span>
                        )}
                      </div>
                      {r.comment && <p className="text-sm text-ink mt-2 leading-relaxed">{r.comment}</p>}
                    </div>
                  </div>
                </div>
              ))}
              {p.reviews.length === 0 && (
                <p className="text-sm text-muted-ink">No reviews yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT: pricing */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
            <div className="grid grid-cols-3 gap-1 bg-accent p-1 rounded-lg">
              {(["hourly", "half_day", "full_day"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={
                    "py-2 text-xs font-medium rounded-md transition " +
                    (tab === t ? "bg-surface text-dark shadow-sm" : "text-muted-ink")
                  }
                >
                  {t === "hourly" ? "Hourly" : t === "half_day" ? "Half day" : "Full day"}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <div className="font-display text-4xl text-dark">
                {formatPrice(priceFor[tab], p.pricing_full?.currency ?? "₹")}
                <span className="text-base text-muted-ink font-sans font-normal ml-1">
                  /{tab === "hourly" ? "hr" : tab === "half_day" ? "4 hrs" : "8 hrs"}
                </span>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {includes[tab].map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm text-ink">
                  <Check size={16} className="text-success mt-0.5 shrink-0" />
                  {it}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="mt-6 w-full bg-honey text-dark py-3 rounded-lg font-semibold hover:bg-amber transition"
            >
              Book this photographer
            </button>
            {p.pricing_full?.custom_project_note && (
              <p className="mt-3 text-xs text-muted-ink leading-relaxed">
                <strong className="text-dark">Custom projects:</strong>{" "}
                {p.pricing_full.custom_project_note}
              </p>
            )}
          </div>
        </aside>
      </main>

      {lightbox !== null && (
        <Lightbox
          items={p.portfolio}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndex={setLightbox}
        />
      )}

      <Footer />
    </div>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: Array<{ id: string; public_url: string; caption: string | null }>;
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const item = items[index];
  function prev() { onIndex((index - 1 + items.length) % items.length); }
  function next() { onIndex((index + 1) % items.length); }
  return (
    <div
      className="fixed inset-0 z-50 bg-dark/95 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
      tabIndex={-1}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
        aria-label="Close"
      >
        <X size={28} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-4 text-white/80 hover:text-white p-2"
        aria-label="Previous"
      >
        <ChevronLeft size={36} />
      </button>
      <img
        src={item.public_url}
        alt={item.caption ?? "Photographer portfolio image"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded"
      />
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-4 text-white/80 hover:text-white p-2"
        aria-label="Next"
      >
        <ChevronRight size={36} />
      </button>
      {item.caption && (
        <div className="absolute bottom-6 left-0 right-0 text-center text-white/80 text-sm px-4">
          {item.caption}
        </div>
      )}
    </div>
  );
}
