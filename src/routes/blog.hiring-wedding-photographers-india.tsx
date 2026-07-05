import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const URL = "https://lenshive.lovable.app/blog/hiring-wedding-photographers-india";
const TITLE = "How to Hire a Wedding Photographer in India (2026 Guide)";
const DESCRIPTION =
  "A practical guide to hiring a wedding photographer in India: evaluating portfolios, hourly vs package pricing, contracts, and the questions to ask before you book.";

export const Route = createFileRoute("/blog/hiring-wedding-photographers-india")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          url: URL,
          mainEntityOfPage: URL,
          datePublished: "2026-01-15",
          dateModified: "2026-07-05",
          inLanguage: "en-IN",
          author: { "@type": "Organization", name: "LensHive", url: "https://lenshive.lovable.app" },
          publisher: {
            "@type": "Organization",
            name: "LensHive",
            logo: { "@type": "ImageObject", url: "https://lenshive.lovable.app/favicon.ico" },
          },
          about: [
            { "@type": "Thing", name: "Wedding photography" },
            { "@type": "Thing", name: "India" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://lenshive.lovable.app/" },
            { "@type": "ListItem", position: 2, name: "Guide", item: URL },
          ],
        }),
      },
    ],
  }),
  component: Post,
});

function Post() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Guide</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{TITLE}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your wedding photos will outlive the venue, the flowers, and probably the outfits.
          Here's how to hire a wedding photographer in India who will do them justice —
          without overpaying or getting locked into a package that doesn't fit.
        </p>

        <h2 className="mt-10 text-xl font-semibold">1. Start with the style, not the price</h2>
        <p className="mt-2 text-sm leading-relaxed">
          Indian weddings span traditional documentary, candid photojournalism,
          fine-art editorial, and cinematic dark-and-moody looks. Scroll through 3–4
          full weddings from any shortlisted photographer — not their highlight reel.
          You're looking for consistency across a full day, not one great frame.
        </p>

        <h2 className="mt-10 text-xl font-semibold">2. Evaluate the portfolio properly</h2>
        <ul className="mt-2 space-y-2 text-sm list-disc list-inside leading-relaxed">
          <li>Do they shoot in your city and light conditions (banquet halls, temple mandaps, outdoor mehendi)?</li>
          <li>How do they handle low-light receptions and mixed lighting?</li>
          <li>Are group formals sharp, well-lit, and cleanly composed?</li>
          <li>Do candid moments feel real, or staged?</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">3. Hourly vs package pricing</h2>
        <p className="mt-2 text-sm leading-relaxed">
          <strong>Hourly</strong> ({"\u20B9"}3,000–{"\u20B9"}8,000/hr on LensHive) works
          for a single event — a court marriage, sangeet, or a portrait session. You
          pay only for time on the ground.
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          <strong>Packages</strong> ({"\u20B9"}80,000–{"\u20B9"}5,00,000+) bundle
          multi-day coverage, a second shooter, an album, and edited deliverables.
          For a full wedding weekend a package is almost always cheaper than the
          equivalent hourly rate — but read what's included.
        </p>

        <h2 className="mt-10 text-xl font-semibold">4. Questions to ask before you book</h2>
        <ul className="mt-2 space-y-2 text-sm list-disc list-inside leading-relaxed">
          <li>Who is actually shooting my wedding — you or an associate?</li>
          <li>How many edited photos will I receive, and in what timeline?</li>
          <li>Do you carry backup cameras and cards?</li>
          <li>What happens if you're sick on the day?</li>
          <li>Are travel, stay, and outstation charges included?</li>
          <li>Do you deliver RAW files, or edited JPEGs only?</li>
          <li>What's the payment schedule and cancellation policy?</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">5. Sign a contract</h2>
        <p className="mt-2 text-sm leading-relaxed">
          Every professional photographer should give you a written agreement covering
          dates, deliverables, timelines, cancellation, and image usage rights. If
          they resist a contract, that's a signal to walk away.
        </p>

        <h2 className="mt-10 text-xl font-semibold">6. Book early</h2>
        <p className="mt-2 text-sm leading-relaxed">
          Peak wedding photographers in Delhi, Mumbai, Bangalore, and Udaipur are
          booked 6–12 months out for shaadi season (October–February). Once you've
          shortlisted 3 photographers, meet or video-call them before deciding —
          you're going to spend more time with this person on the day than with
          most of your relatives.
        </p>

        <div className="mt-12 rounded-xl border bg-muted/40 p-6">
          <h3 className="text-lg font-semibold">Ready to find yours?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse vetted wedding photographers across India — filter by city,
            budget, and availability.
          </p>
          <Link
            to="/browse"
            search={{ specialty: "Wedding" }}
            className="mt-4 inline-flex items-center rounded-md bg-honey px-5 py-2.5 text-sm font-medium text-dark hover:bg-amber"
          >
            Browse wedding photographers
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
