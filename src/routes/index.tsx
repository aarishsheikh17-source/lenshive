import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight, Star, Users, MapPin, Camera } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CardGrid, GridSkeleton } from "@/components/photographers/CardGrid";
import { listPhotographers } from "@/lib/photographers";
import { SPECIALTIES } from "@/lib/utils-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LensHive — Hire Professional Photographers in India" },
      {
        name: "description",
        content:
          "Find and hire professional photographers for weddings, reels, brand shoots and portraits across India and worldwide. Browse portfolios and hire by hour, half-day or full-day.",
      },
      { property: "og:title", content: "LensHive — Hire Professional Photographers" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const CHIPS = ["All", ...SPECIALTIES] as const;

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("All");

  const { data, isLoading } = useQuery({
    queryKey: ["featured-photographers"],
    queryFn: () => listPhotographers({ limit: 8 }),
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (chip === "All") return data;
    return data.filter((p) => p.specializations.some((s) => s.toLowerCase() === chip.toLowerCase()));
  }, [data, chip]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      to: "/browse",
      search: { q: query || undefined, specialty: specialty || undefined } as any,
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-cream to-cream" />
        <div className="absolute inset-0 opacity-50"
             style={{ background: "radial-gradient(60% 60% at 80% 20%, oklch(0.92 0.08 75 / 0.5), transparent)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-ink bg-surface border border-border rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-honey" />
            1,200+ photographers · 48 cities
          </span>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-dark mt-6 leading-[1.05]">
            Find your perfect<br />
            <span className="text-honey">photographer.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-ink max-w-2xl mx-auto">
            Hire by hour, half-day, or project — weddings, reels, brand shoots, events and more
            across India and worldwide.
          </p>

          <form
            onSubmit={search}
            className="mt-8 max-w-3xl mx-auto bg-surface border border-border rounded-2xl p-2 shadow-card flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={18} className="text-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City or photographer name…"
                className="w-full bg-transparent py-3 text-sm placeholder:text-soft focus:outline-none"
              />
            </div>
            <div className="border-l border-border hidden sm:block" />
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="bg-transparent text-sm px-3 py-3 sm:py-0 focus:outline-none text-ink"
            >
              <option value="">All specialties</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-honey hover:bg-amber text-dark font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              Search <ArrowRight size={16} />
            </button>
          </form>

          {/* trust strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: "1,200+", l: "Photographers", icon: Camera },
              { v: "48", l: "Cities", icon: MapPin },
              { v: "12,000+", l: "Shoots", icon: Users },
              { v: "4.9★", l: "Avg rating", icon: Star },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <s.icon size={18} className="text-honey mx-auto mb-1" />
                <div className="font-display text-2xl text-dark">{s.v}</div>
                <div className="text-xs text-muted-ink uppercase tracking-wide">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHIP STRIP + FEATURED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-dark">Featured photographers</h2>
            <p className="text-sm text-muted-ink mt-1">Browse top-rated talent across categories.</p>
          </div>
          <Link
            to="/browse"
            className="hidden sm:inline-flex text-sm text-ink hover:text-dark items-center gap-1.5"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 -mx-4 px-4">
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => setChip(c)}
              className={
                "whitespace-nowrap px-4 py-2 rounded-full text-sm border transition " +
                (chip === c
                  ? "bg-dark text-white border-dark"
                  : "bg-surface text-ink border-border hover:border-border2")
              }
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <GridSkeleton count={8} />
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <p className="text-muted-ink">No photographers in this category yet.</p>
          </div>
        ) : (
          <CardGrid items={filtered} />
        )}
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-dark text-white py-20 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-white text-center">How LensHive works</h2>
          <p className="text-white/60 text-center mt-2 text-sm">From search to shoot in four steps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { t: "Search", d: "Filter by city, specialty, and budget." },
              { t: "Choose a plan", d: "Hourly, half-day, full-day, or custom project." },
              { t: "Contact directly", d: "Enquire, WhatsApp, or Instagram — no middlemen." },
              { t: "Shoot & review", d: "Get amazing photos and share your experience." },
            ].map((s, i) => (
              <div key={s.t} className="border border-white/10 rounded-xl p-6 bg-white/[0.03]">
                <div className="lh-hex w-9 h-9 bg-honey flex items-center justify-center text-dark font-display text-base">
                  {i + 1}
                </div>
                <h3 className="font-display text-xl text-white mt-4">{s.t}</h3>
                <p className="text-white/60 text-sm mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHOTOGRAPHER CTA */}
      <section id="photographers" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-honey rounded-3xl p-10 sm:p-14 text-center shadow-pop">
            <h2 className="font-display text-3xl sm:text-5xl text-dark">Are you a photographer?</h2>
            <p className="mt-3 text-dark/80 max-w-xl mx-auto">
              Create your free profile, showcase your portfolio, and get hired by clients across
              India and worldwide.
            </p>
            <button
              type="button"
              disabled
              className="mt-6 bg-dark text-white px-7 py-3 rounded-xl font-semibold opacity-90 cursor-not-allowed"
              title="Sign-up opens in the next phase"
            >
              Join free — coming soon →
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
