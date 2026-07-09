import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchPhotographers from "./tools/search-photographers";
import getPhotographerTool from "./tools/get-photographer";

// The OAuth issuer MUST be the direct Supabase host, not the .lovable.cloud proxy.
// VITE_SUPABASE_PROJECT_ID is inlined at build time by Vite.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "lenshive-mcp",
  title: "LensHive MCP",
  version: "0.1.0",
  instructions:
    "Tools for LensHive, a directory of professional photographers. Use `search_photographers` to find photographers by specialty, city, price, availability, or free-text keyword. Use `get_photographer` with an id from search results to fetch the full profile including bio, pricing, portfolio, and reviews.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchPhotographers, getPhotographerTool],
});
