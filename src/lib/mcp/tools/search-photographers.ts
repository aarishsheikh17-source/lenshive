import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { listPhotographers } from "@/lib/photographers";

export default defineTool({
  name: "search_photographers",
  title: "Search photographers",
  description:
    "Search LensHive's published photographers by keyword, specialty, city, price range, travel availability, and current availability. Returns a compact list with id, name, location, specializations, rating, and hourly rate.",
  inputSchema: {
    q: z.string().optional().describe("Free-text keyword (name, city, country, or specialty)."),
    specialty: z.string().optional().describe("Specialty tag such as Wedding, Portrait, Product."),
    city: z.string().optional().describe("City name (case-insensitive)."),
    minHourly: z.number().nonnegative().optional().describe("Minimum hourly rate."),
    maxHourly: z.number().nonnegative().optional().describe("Maximum hourly rate."),
    travelOnly: z.boolean().optional().describe("Only photographers who travel for shoots."),
    availableOnly: z.boolean().optional().describe("Only photographers currently accepting bookings."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 24)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const rows = await listPhotographers(input);
    const compact = rows.map((r) => ({
      id: r.id,
      name: r.profile?.full_name ?? null,
      verified: r.profile?.is_verified ?? false,
      city: r.city,
      country: r.country,
      specializations: r.specializations,
      rating: r.rating,
      total_reviews: r.total_reviews,
      is_available: r.is_available,
      available_for_travel: r.available_for_travel,
      hourly_rate: r.pricing?.hourly_rate ?? null,
      currency: r.pricing?.currency ?? null,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(compact, null, 2) }],
      structuredContent: { results: compact, count: compact.length },
    };
  },
});
