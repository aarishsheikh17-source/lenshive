import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { listPhotographers } from "@/lib/photographers";
import { AlertCircle, CheckCircle2, Lightbulb, Loader2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/seo/jsonld-validator")({
  head: () => ({
    meta: [
      { title: "JSON-LD Validator — LensHive SEO" },
      { name: "description", content: "Validate schema.org JSON-LD structured data on every photographer profile and blog post to ensure rich snippets render correctly." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "JSON-LD Validator — LensHive SEO" },
      { property: "og:url", content: "https://lenshive.lovable.app/seo/jsonld-validator" },
    ],
    links: [{ rel: "canonical", href: "https://lenshive.lovable.app/seo/jsonld-validator" }],
  }),
  component: JsonLdValidatorPage,
});

type SchemaIssue = {
  level: "error" | "warning";
  type: string;              // schema.org @type where the issue was found
  field: string | null;      // exact missing/invalid field (null for structural)
  path: string;              // JSON path e.g. $.mainEntity.address
  message: string;           // human-readable summary
  hint: string;              // quick-fix suggestion
};
type BlockResult = { index: number; type: string; issues: SchemaIssue[]; raw: unknown };
type PageResult = {
  url: string;
  path: string;
  label: string;
  status: "ok" | "fetch-failed" | "no-jsonld";
  httpStatus?: number;
  blocks: BlockResult[];
  errorCount: number;
  warningCount: number;
  missingByType: Record<string, string[]>; // aggregate: type -> [fields]
};

// Minimal schema.org rules for the types this site emits.
const REQUIRED: Record<string, string[]> = {
  Organization: ["name", "url"],
  WebSite: ["name", "url"],
  ProfilePage: ["mainEntity"],
  Person: ["name"],
  Article: ["headline", "author", "datePublished"],
  BreadcrumbList: ["itemListElement"],
  AggregateRating: ["ratingValue", "reviewCount"],
  Review: ["reviewRating", "author"],
  Offer: ["price", "priceCurrency"],
  ListItem: ["position", "name", "item"],
  Rating: ["ratingValue"],
  ImageObject: ["url"],
  PostalAddress: [],
};

// Quick-fix hints keyed by `${type}.${field}` — fallback to generic per-type hint.
const HINTS: Record<string, string> = {
  "Article.headline": 'Add "headline": "<article title, ≤110 chars>" to the Article node.',
  "Article.author": 'Add "author": { "@type": "Person", "name": "<author>" } (or Organization).',
  "Article.datePublished": 'Add "datePublished": "<ISO 8601, e.g. 2026-01-15>".',
  "Person.name": 'Add "name": "<full name>" to the Person node.',
  "ProfilePage.mainEntity": 'Add "mainEntity": { "@type": "Person", "name": "…", … } describing the profile subject.',
  "Organization.name": 'Add "name": "LensHive" (or your brand) to the Organization.',
  "Organization.url": 'Add "url": "https://lenshive.lovable.app" to the Organization.',
  "WebSite.name": 'Add "name": "<site name>" to the WebSite node.',
  "WebSite.url": 'Add "url": "<canonical site URL>" to the WebSite node.',
  "BreadcrumbList.itemListElement": 'Add "itemListElement": [{"@type":"ListItem","position":1,"name":"Home","item":"https://…"}, …].',
  "AggregateRating.ratingValue": 'Add "ratingValue": <number 1-5> to AggregateRating.',
  "AggregateRating.reviewCount": 'Add "reviewCount": <integer ≥ 1> to AggregateRating (omit the whole block if there are no reviews).',
  "Review.reviewRating": 'Add "reviewRating": { "@type": "Rating", "ratingValue": <1-5> } to each Review.',
  "Review.author": 'Add "author": { "@type": "Person", "name": "<reviewer>" } to each Review.',
  "Offer.price": 'Add "price": "<numeric string, e.g. 5000>" to the Offer.',
  "Offer.priceCurrency": 'Add "priceCurrency": "INR" (or the correct ISO 4217 code) to the Offer.',
  "ListItem.position": 'Add "position": <1-based integer> to each ListItem.',
  "ListItem.name": 'Add "name": "<breadcrumb label>" to each ListItem.',
  "ListItem.item": 'Add "item": "<absolute URL>" to each ListItem.',
  "Rating.ratingValue": 'Add "ratingValue": <number 1-5> to the Rating.',
  "ImageObject.url": 'Add "url": "<absolute https:// image URL>" to the ImageObject.',
};

function hintFor(type: string, field: string | null): string {
  if (!field) return `Wrap the JSON in a valid schema.org node with "@context": "https://schema.org" and a "@type".`;
  return (
    HINTS[`${type}.${field}`] ??
    `Add a "${field}" property to the ${type} node (see https://schema.org/${type}).`
  );
}

function typeOf(node: any): string {
  const t = node?.["@type"];
  if (Array.isArray(t)) return t.join(",");
  return typeof t === "string" ? t : "Unknown";
}

function validateNode(node: any, path: string, issues: SchemaIssue[]) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((n, i) => validateNode(n, `${path}[${i}]`, issues));
    return;
  }
  const t = node["@type"];
  const types = Array.isArray(t) ? t : t ? [t] : [];
  for (const ty of types) {
    const req = REQUIRED[ty];
    if (!req) {
      if (!/^https?:\/\/schema\.org/.test(String(node["@context"] ?? "")) && path === "$") {
        issues.push({
          level: "warning",
          type: ty,
          field: null,
          path,
          message: `Unknown @type "${ty}" — no validation rules registered.`,
          hint: `Register a rule for "${ty}" in REQUIRED, or verify the type name against https://schema.org/${ty}.`,
        });
      }
      continue;
    }
    for (const field of req) {
      const v = node[field];
      const missing = v === undefined || v === null || v === "";
      if (missing) {
        issues.push({
          level: "error",
          type: ty,
          field,
          path,
          message: `${ty} is missing required "${field}" (at ${path})`,
          hint: hintFor(ty, field),
        });
      }
    }
  }
  // Context check at root
  if (path === "$" && !node["@context"]) {
    issues.push({
      level: "error",
      type: typeOf(node),
      field: "@context",
      path,
      message: `Root node missing "@context"`,
      hint: 'Add "@context": "https://schema.org" as the first property of the root JSON-LD node.',
    });
  }
  // Recurse
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("@")) continue;
    if (v && typeof v === "object") validateNode(v, `${path}.${k}`, issues);
  }
}

async function validatePage(path: string, label: string): Promise<PageResult> {
  const url = `${window.location.origin}${path}`;
  const empty: Record<string, string[]> = {};
  try {
    const res = await fetch(path, { headers: { accept: "text/html" } });
    if (!res.ok) {
      return { url, path, label, status: "fetch-failed", httpStatus: res.status, blocks: [], errorCount: 1, warningCount: 0, missingByType: empty };
    }
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    if (scripts.length === 0) {
      return { url, path, label, status: "no-jsonld", blocks: [], errorCount: 1, warningCount: 0, missingByType: empty };
    }
    const blocks: BlockResult[] = [];
    const missingByType: Record<string, string[]> = {};
    let errorCount = 0;
    let warningCount = 0;
    scripts.forEach((s, i) => {
      const issues: SchemaIssue[] = [];
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(s.textContent ?? "");
        validateNode(parsed, "$", issues);
      } catch (e) {
        issues.push({
          level: "error",
          type: "Invalid",
          field: null,
          path: "$",
          message: `Invalid JSON: ${(e as Error).message}`,
          hint: "Re-serialize the JSON-LD; check for trailing commas, unescaped quotes, or truncated output.",
        });
      }
      const type = parsed && typeof parsed === "object" ? typeOf(parsed) : "Invalid";
      for (const iss of issues) {
        iss.level === "error" ? errorCount++ : warningCount++;
        if (iss.level === "error" && iss.field) {
          const list = missingByType[iss.type] ?? (missingByType[iss.type] = []);
          if (!list.includes(iss.field)) list.push(iss.field);
        }
      }
      blocks.push({ index: i, type, issues, raw: parsed });
    });
    return { url, path, label, status: "ok", blocks, errorCount, warningCount, missingByType };
  } catch {
    return { url, path, label, status: "fetch-failed", blocks: [], errorCount: 1, warningCount: 0, missingByType: empty };
  }
}

function JsonLdValidatorPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<PageResult[]>([]);

  const { data: photographers } = useQuery({
    queryKey: ["validator-photographers"],
    queryFn: () => listPhotographers({ limit: 50 }),
  });

  const targets = useMemo(() => {
    const list: { path: string; label: string }[] = [
      { path: "/blog/hiring-wedding-photographers-india", label: "Blog: Hiring wedding photographers in India" },
    ];
    (photographers ?? []).forEach((p) => {
      list.push({ path: `/photographers/${p.id}`, label: `Photographer: ${p.profile?.full_name ?? p.id}` });
    });
    return list;
  }, [photographers]);

  async function runAll() {
    setRunning(true);
    setResults([]);
    const out: PageResult[] = [];
    for (const t of targets) {
      const r = await validatePage(t.path, t.label);
      out.push(r);
      setResults([...out]);
    }
    setRunning(false);
  }

  const totalErrors = results.reduce((s, r) => s + r.errorCount, 0);
  const totalWarnings = results.reduce((s, r) => s + r.warningCount, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <header className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl text-dark">JSON-LD Validator</h1>
          <p className="text-muted-ink mt-2 max-w-2xl">
            Fetches every photographer profile and blog post, extracts each
            <code className="mx-1 px-1.5 py-0.5 bg-accent rounded text-xs">application/ld+json</code>
            block, and lists the exact schema.org fields missing per page with a quick-fix hint.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={runAll}
              disabled={running || targets.length === 0}
              className="inline-flex items-center gap-2 bg-honey text-dark px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {running ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {running ? "Validating…" : `Validate ${targets.length} pages`}
            </button>
            {results.length > 0 && (
              <div className="text-sm text-muted-ink">
                <span className={totalErrors ? "text-danger font-semibold" : "text-success font-semibold"}>
                  {totalErrors} error{totalErrors === 1 ? "" : "s"}
                </span>
                {" · "}
                <span>{totalWarnings} warning{totalWarnings === 1 ? "" : "s"}</span>
                {" · "}
                <span>{results.length}/{targets.length} pages</span>
              </div>
            )}
          </div>
        </header>

        {results.length === 0 && !running && (
          <p className="text-sm text-muted-ink">Click <strong>Validate</strong> to begin.</p>
        )}

        <ul className="space-y-4">
          {results.map((r) => {
            const missingEntries = Object.entries(r.missingByType);
            return (
              <li key={r.path} className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {r.errorCount === 0 && r.status === "ok" ? (
                        <CheckCircle2 size={18} className="text-success shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="text-danger shrink-0" />
                      )}
                      <span className="font-semibold text-dark truncate">{r.label}</span>
                    </div>
                    <Link to={r.path as any} className="text-xs text-muted-ink hover:text-dark break-all">
                      {r.path}
                    </Link>
                  </div>
                  <div className="text-xs text-muted-ink text-right shrink-0">
                    {r.status === "fetch-failed" && <span className="text-danger">Fetch failed{r.httpStatus ? ` (${r.httpStatus})` : ""}</span>}
                    {r.status === "no-jsonld" && <span className="text-danger">No JSON-LD found</span>}
                    {r.status === "ok" && <span>{r.blocks.length} block{r.blocks.length === 1 ? "" : "s"}</span>}
                  </div>
                </div>

                {missingEntries.length > 0 && (
                  <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-3">
                    <div className="text-xs font-semibold text-danger uppercase tracking-wide">
                      Missing required fields
                    </div>
                    <ul className="mt-2 space-y-1">
                      {missingEntries.map(([type, fields]) => (
                        <li key={type} className="text-xs text-dark">
                          <span className="font-mono font-semibold">{type}</span>
                          <span className="text-muted-ink"> is missing </span>
                          {fields.map((f, i) => (
                            <span key={f}>
                              <code className="px-1 py-0.5 bg-white border border-border rounded text-[11px]">{f}</code>
                              {i < fields.length - 1 && <span className="text-muted-ink">, </span>}
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.blocks.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {r.blocks.map((b) => (
                      <div key={b.index} className="border border-border rounded-lg p-3 bg-accent/40">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-dark">
                            Block #{b.index + 1} — <span className="font-mono">{b.type}</span>
                          </span>
                          <span className={"text-xs " + (b.issues.some((i) => i.level === "error") ? "text-danger" : b.issues.length ? "text-honey-dark" : "text-success")}>
                            {b.issues.length === 0 ? "Valid" : `${b.issues.length} issue${b.issues.length === 1 ? "" : "s"}`}
                          </span>
                        </div>
                        {b.issues.length > 0 && (
                          <ul className="mt-2 space-y-2">
                            {b.issues.map((iss, i) => (
                              <li key={i} className="text-xs">
                                <div className={"flex gap-2 items-start " + (iss.level === "error" ? "text-danger" : "text-muted-ink")}>
                                  <span className="font-semibold uppercase shrink-0">{iss.level}</span>
                                  <div className="min-w-0">
                                    <div>
                                      <span className="font-mono">{iss.type}</span>
                                      {iss.field && <> · missing <code className="px-1 py-0.5 bg-white border border-border rounded text-[11px]">{iss.field}</code></>}
                                      <span className="text-muted-ink"> at </span>
                                      <code className="text-[11px] font-mono">{iss.path}</code>
                                    </div>
                                    <div className="mt-1 flex gap-1.5 items-start text-dark bg-honey/15 border border-honey/40 rounded px-2 py-1.5">
                                      <Lightbulb size={12} className="mt-0.5 shrink-0 text-honey-dark" />
                                      <span>{iss.hint}</span>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
