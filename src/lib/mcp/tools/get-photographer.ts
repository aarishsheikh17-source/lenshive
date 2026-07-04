import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPhotographer } from "@/lib/photographers";

export default defineTool({
  name: "get_photographer",
  title: "Get photographer details",
  description:
    "Fetch full public profile for a photographer by id: bio, pricing tiers, portfolio, contact handles, and recent reviews.",
  inputSchema: {
    id: z.string().min(1).describe("Photographer profile id (UUID)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const p = await getPhotographer(id);
    if (!p) {
      return {
        content: [{ type: "text", text: `No published photographer found with id ${id}.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(p, null, 2) }],
      structuredContent: { photographer: p },
    };
  },
});
