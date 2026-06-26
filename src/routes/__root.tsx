import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl text-dark">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-honey px-5 py-2.5 text-sm font-medium text-dark transition hover:bg-amber"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-honey px-4 py-2 text-sm font-medium text-dark transition hover:bg-amber"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#F5A623" },
      { title: "LensHive — Hire Professional Photographers in India" },
      {
        name: "description",
        content:
          "Find and hire professional photographers for weddings, reels, brand shoots, events and portraits across India and worldwide. Browse portfolios and hire by hour or project.",
      },
      { property: "og:title", content: "LensHive — Hire Professional Photographers in India" },
      {
        property: "og:description",
        content:
          "A marketplace of vetted photographers across India and worldwide. Search by city, specialty and budget.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "LensHive" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "LensHive — Hire Professional Photographers in India" },
      { name: "description", content: "LensHive is a photographer marketplace connecting clients with professionals." },
      { property: "og:description", content: "LensHive is a photographer marketplace connecting clients with professionals." },
      { name: "twitter:description", content: "LensHive is a photographer marketplace connecting clients with professionals." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8316d39a-e1b2-4287-9a19-2eed42dda5c3/id-preview-5c4b1a7b--4b2b89a7-ec7d-4e8c-bcef-367629824bdf.lovable.app-1782467668621.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8316d39a-e1b2-4287-9a19-2eed42dda5c3/id-preview-5c4b1a7b--4b2b89a7-ec7d-4e8c-bcef-367629824bdf.lovable.app-1782467668621.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
