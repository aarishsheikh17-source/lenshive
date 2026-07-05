import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect an AI assistant to LensHive" },
      {
        name: "description",
        content:
          "Connect ChatGPT or Claude to LensHive so your AI assistant can search photographers and read profiles for you.",
      },
      { property: "og:title", content: "Connect an AI assistant to LensHive" },
      {
        property: "og:description",
        content:
          "Step-by-step instructions to connect ChatGPT or Claude to LensHive via MCP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConnectPage,
});

function ConnectPage() {
  const [mcpUrl, setMcpUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMcpUrl(new URL("/mcp", window.location.origin).toString());
  }, []);

  const copy = async () => {
    if (!mcpUrl) return;
    await navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
        Connect an AI assistant to LensHive
      </h1>
      <p className="mt-3 text-muted-foreground">
        LensHive exposes an MCP server so assistants like ChatGPT and Claude can
        search photographers and read profiles on your behalf. Paste the URL
        below into your assistant's connectors settings.
      </p>

      <Card className="mt-8 p-4 sm:p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          MCP server URL
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate rounded-md bg-muted px-3 py-2 text-sm font-mono">
            {mcpUrl || "Loading…"}
          </code>
          <Button onClick={copy} disabled={!mcpUrl} variant="secondary" size="sm">
            {copied ? (
              <>
                <Check className="size-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-4" /> Copy
              </>
            )}
          </Button>
        </div>
      </Card>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Connect ChatGPT</h2>
        <ol className="mt-3 space-y-2 list-decimal list-inside text-sm leading-relaxed">
          <li>
            Open{" "}
            <a
              className="underline"
              href="https://chatgpt.com/#settings/Connectors/Advanced"
              target="_blank"
              rel="noreferrer"
            >
              ChatGPT → Settings → Connectors → Advanced
            </a>{" "}
            and enable Developer mode (read the risk notice first).
          </li>
          <li>In the chat composer's "+" menu, turn on Developer mode.</li>
          <li>Click "Add sources", then "Connect more".</li>
          <li>Name the connector "LensHive" and paste the MCP URL above.</li>
          <li>Ask ChatGPT to find photographers on LensHive.</li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Connect Claude</h2>
        <ol className="mt-3 space-y-2 list-decimal list-inside text-sm leading-relaxed">
          <li>
            Open{" "}
            <a
              className="underline"
              href="https://claude.ai/customize/connectors?modal=add-custom-connector"
              target="_blank"
              rel="noreferrer"
            >
              Claude → Custom connectors
            </a>
            .
          </li>
          <li>Name the connector "LensHive" and paste the MCP URL above.</li>
          <li>
            Enable the connector from the chat composer, then ask Claude to
            find a photographer for you.
          </li>
        </ol>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        Once connected, your assistant can search photographers by specialty,
        city, price, and availability, and pull up full profiles with pricing
        and reviews.
      </p>
    </main>
  );
}
