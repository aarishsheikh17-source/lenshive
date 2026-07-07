import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { listPhotographers } from "@/lib/photographers";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

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

type SchemaIssue = { level: "error" | "warning"; message: string };
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
        issues.push({ level: "warning", message: `Unknown @type "${ty}" at ${path} (no validation rules)` });
      }
      continue;
    }
    for (const field of req) {
      if (node[field] === undefined || node[field] === null || node[field] === "") {
        issues.push({ level: "error", message: `${ty} at ${path} is missing required "${field}"` });
      }
    }
  }
  // Context check at root
  if (path === "$" && !node["@context"]) {
    issues.push({ level: "error", message: `Root node missing "@context"` });
  }
  // Recurse
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("@")) continue;
    if (v && typeof v === "object") validateNode(v, `${path}.${k}`, issues);
  }
}

async function validatePage(path: string, label: string): Promise<PageResult> {
  const url = `${window.location.origin}${path}`;
  try {
    const res = await fetch(path, { headers: { accept: "text/html" } });
    if (!res.ok) {
      return { url, path, label, status: "fetch-failed", httpStatus: res.status, blocks: [], errorCount: 1, warningCount: 0 };
    }
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    if (scripts.length === 0) {
      return { url, path, label, status: "no-jsonld", blocks: [], errorCount: 1, warningCount: 0 };
    }
    const blocks: BlockResult[] = [];
    let errorCount = 0;
    let warningCount = 0;
    scripts.forEach((s, i) => {
      const issues: SchemaIssue[] = [];
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(s.textContent ?? "");
        validateNode(parsed, "$", issues);
      } catch (e) {
        issues.push({ level: "error", message: `Invalid JSON: ${(e as Error).message}` });
      }
      const type = parsed && typeof parsed === "object" ? typeOf(parsed) : "Invalid";
      for (const iss of issues) iss.level === "error" ? errorCount++ : warningCount++;
      blocks.push({ index: i, type, issues, raw: parsed });
    });
    return { url, path, label, status: "ok", blocks, errorCount, warningCount };
  } catch (e) {
    return { url, path, label, status: "fetch-failed", blocks: [], errorCount: 1, warningCount: 0 };
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
    // Sequential to keep dev server calm
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
            block, and checks schema.org required fields so rich snippets render.
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
          {results.map((r) => (
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
                        <ul className="mt-2 space-y-1">
                          {b.issues.map((iss, i) => (
                            <li key={i} className={"text-xs flex gap-2 " + (iss.level === "error" ? "text-danger" : "text-muted-ink")}>
                              <span className="font-semibold uppercase">{iss.level}</span>
                              <span>{iss.message}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
