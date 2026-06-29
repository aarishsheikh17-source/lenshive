import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { Search, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CardGrid, GridSkeleton } from "@/components/photographers/CardGrid";
import { listPhotographers } from "@/lib/photographers";
import { SPECIALTIES } from "@/lib/utils-app";

const search = z.object({
  q: z.string().optional(),
  specialty: z.string().optional(),
  price: z.enum(["any", "under3", "3to6", "above6"]).optional(),
  available: z.coerce.boolean().optional(),
  travel: z.coerce.boolean().optional(),
});
type SearchParams = z.infer<typeof search>;

export const Route = createFileRoute("/browse")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Browse photographers — LensHive" },
      {
        name: "description",
        content:
          "Browse and hire professional photographers across India and worldwide. Filter by city, specialty, and budget.",
      },
      { property: "og:title", content: "Browse photographers — LensHive" },
      {
        property: "og:description",
        content:
          "Search the LensHive directory of vetted photographers. Filter by city, specialty, availability and budget to find your match.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lenshive.lovable.app/browse" },
    ],
    links: [{ rel: "canonical", href: "https://lenshive.lovable.app/browse" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Browse photographers — LensHive",
          url: "https://lenshive.lovable.app/browse",
          description: "Directory of professional photographers on LensHive.",
        }),
      },
    ],
  }),
  component: BrowsePage,
});

const PRICE_BUCKETS: Record<string, { min?: number; max?: number; label: string }> = {
  any: { label: "Any price" },
  under3: { max: 3000, label: "Under ₹3,000/hr" },
  "3to6": { min: 3000, max: 6000, label: "₹3,000 – ₹6,000" },
  above6: { min: 6000, label: "Above ₹6,000" },
};

function BrowsePage() {
  const search = Route.useSearch() as SearchParams;
  const navigate = useNavigate({ from: "/browse" });
  const [q, setQ] = useState(search.q ?? "");

  // debounce text input → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== (search.q ?? "")) {
        navigate({ search: (s: any) => ({ ...s, q: q || undefined }), replace: true });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line

  const bucket = PRICE_BUCKETS[search.price ?? "any"];

  const filters = useMemo(
    () => ({
      q: search.q,
      specialty: search.specialty,
      minHourly: bucket.min,
      maxHourly: bucket.max,
      availableOnly: search.available,
      travelOnly: search.travel,
      limit: 48,
    }),
    [search, bucket],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["browse", filters],
    queryFn: () => listPhotographers(filters),
  });

  const hasFilters = !!(
    search.q || search.specialty || search.price || search.available || search.travel
  );

  function update<K extends keyof SearchParams>(k: K, v: SearchParams[K]) {
    navigate({ search: (s: any) => ({ ...s, [k]: v || undefined }), replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-surface border-b border-border sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-cream border border-border rounded-lg px-3 py-2 flex-1 min-w-[220px]">
            <Search size={16} className="text-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by city, name, or specialty…"
              aria-label="Search photographers by city, name, or specialty"
              className="bg-transparent text-sm w-full focus:outline-none"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search">
                <X size={14} className="text-soft" />
              </button>
            )}
          </div>
          <select
            value={search.specialty ?? ""}
            onChange={(e) => update("specialty", (e.target.value || undefined) as any)}
            aria-label="Filter by specialty"
            className="bg-cream border border-border rounded-lg text-sm px-3 py-2 text-ink"
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={search.price ?? "any"}
            onChange={(e) => update("price", e.target.value as any)}
            aria-label="Filter by price range"
            className="bg-cream border border-border rounded-lg text-sm px-3 py-2 text-ink"
          >
            {Object.entries(PRICE_BUCKETS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-ink bg-cream border border-border rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!search.available}
              onChange={(e) => update("available", e.target.checked || undefined)}
              className="accent-honey"
            />
            Available now
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-ink bg-cream border border-border rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!search.travel}
              onChange={(e) => update("travel", e.target.checked || undefined)}
              className="accent-honey"
            />
            Travels
          </label>
          {hasFilters && (
            <button
              onClick={() => navigate({ search: {} as any, replace: true })}
              className="text-xs text-muted-ink hover:text-dark underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="flex items-end justify-between mb-6">
          <h1 className="font-display text-3xl text-dark">Browse photographers</h1>
          <p className="text-sm text-muted-ink">
            {isLoading ? "Searching…" : `${data?.length ?? 0} found`}
          </p>
        </div>

        {isLoading ? (
          <GridSkeleton count={8} />
        ) : !data || data.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center">
            <h2 className="font-display text-2xl text-dark">No photographers found</h2>
            <p className="text-muted-ink mt-2">Try changing your filters or clearing them.</p>
            {hasFilters && (
              <button
                onClick={() => navigate({ search: {} as any, replace: true })}
                className="mt-5 bg-honey hover:bg-amber text-dark px-5 py-2.5 rounded-md text-sm font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <CardGrid items={data} />
        )}
      </main>

      <Footer />
    </div>
  );
}
