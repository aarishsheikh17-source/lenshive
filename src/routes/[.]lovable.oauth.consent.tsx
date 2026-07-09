import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string; client_id?: string; logo_uri?: string } | null;
  redirect_uri?: string | null;
  scope?: string | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

// Beta typed wrapper for supabase.auth.oauth — avoids fishing in node_modules.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { mode: "signin", redirect: next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id");
    if (!authorizationId) return { error: "Missing authorization_id" as const, details: null };
    const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
    if (error) return { error: error.message, details: null };
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return { error: null, details: data };
  },
  head: () => ({
    meta: [
      { title: "Connect an app — LensHive" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Consent,
  errorComponent: ({ error }) => (
    <Shell>
      <h1 className="font-serif text-2xl text-dark">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink/70">
        We couldn't load this authorization request: {String((error as Error)?.message ?? error)}
      </p>
      <p className="mt-4"><Link to="/" className="text-sm text-dark underline">Back to LensHive</Link></p>
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-sm">{children}</div>
    </div>
  );
}

function Consent() {
  const { error, details } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  if (error || !details) {
    return (
      <Shell>
        <h1 className="font-serif text-2xl text-dark">Authorization unavailable</h1>
        <p className="mt-2 text-sm text-ink/70">{error ?? "This request has expired or is invalid."}</p>
        <p className="mt-4"><Link to="/" className="text-sm text-dark underline">Back to LensHive</Link></p>
      </Shell>
    );
  }

  const clientName = details.client?.name ?? "an app";
  const scopes = (details.scope ?? "").split(/\s+/).filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setDecisionError(null);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setDecisionError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setDecisionError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  return (
    <Shell>
      <h1 className="font-serif text-2xl text-dark">
        Connect {clientName} to your LensHive account
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        {clientName} will be able to call LensHive's MCP tools while you are signed in.
      </p>

      {scopes.length > 0 && (
        <div className="mt-4 rounded-md border border-border bg-cream/40 p-3">
          <p className="text-xs font-medium text-ink">Requested access</p>
          <ul className="mt-1 text-sm text-ink/80 list-disc list-inside">
            {scopes.map((s: string) => (
              <li key={s}>{s === "openid" ? "Verify your identity" : s === "email" ? "Share your email" : s === "profile" ? "Share your basic profile" : `Additional permission: ${s}`}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-ink/60">
        This does not bypass LensHive's permissions. The app can only see and do what your account is allowed to.
      </p>

      {decisionError && (
        <p role="alert" className="mt-3 text-sm text-red-600">{decisionError}</p>
      )}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => decide(true)}
          className="flex-1 bg-honey text-dark font-medium px-4 py-2.5 rounded-md hover:bg-amber transition disabled:opacity-60"
        >
          {busy ? "Please wait…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide(false)}
          className="flex-1 border border-border bg-white text-ink font-medium px-4 py-2.5 rounded-md hover:bg-cream transition disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </Shell>
  );
}
