import { supabase } from "@/integrations/supabase/client";

export type PhotographerListItem = {
  id: string;
  user_id: string;
  bio: string | null;
  years_experience: string | null;
  specializations: string[];
  is_available: boolean;
  available_for_travel: boolean;
  city: string | null;
  country: string | null;
  rating: number;
  total_reviews: number;
  is_published: boolean;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
  pricing: {
    currency: string;
    hourly_rate: number | null;
  } | null;
  cover_url: string | null;
};

export type BrowseFilters = {
  q?: string;
  specialty?: string;
  maxHourly?: number;
  minHourly?: number;
  travelOnly?: boolean;
  availableOnly?: boolean;
  city?: string;
  limit?: number;
};

const LIST_SELECT = `
  id, user_id, bio, years_experience, specializations,
  is_available, available_for_travel, city, country,
  rating, total_reviews, is_published,
  profile:profiles!photographer_profiles_user_id_fkey ( full_name, avatar_url, is_verified ),
  pricing ( currency, hourly_rate ),
  portfolio_items ( public_url, display_order )
`;

function normalize(row: any): PhotographerListItem {
  const cover =
    (row.portfolio_items ?? [])
      .slice()
      .sort((a: any, b: any) => a.display_order - b.display_order)[0]?.public_url ?? null;
  return {
    id: row.id,
    user_id: row.user_id,
    bio: row.bio,
    years_experience: row.years_experience,
    specializations: row.specializations ?? [],
    is_available: row.is_available,
    available_for_travel: row.available_for_travel,
    city: row.city,
    country: row.country,
    rating: Number(row.rating ?? 0),
    total_reviews: row.total_reviews ?? 0,
    is_published: row.is_published,
    profile: row.profile ?? null,
    pricing: row.pricing ?? null,
    cover_url: cover,
  };
}

export async function listPhotographers(filters: BrowseFilters = {}): Promise<PhotographerListItem[]> {
  let q = supabase
    .from("photographer_profiles")
    .select(LIST_SELECT)
    .eq("is_published", true)
    .order("rating", { ascending: false })
    .limit(filters.limit ?? 24);

  if (filters.specialty && filters.specialty !== "All") {
    q = q.contains("specializations", [filters.specialty]);
  }
  if (filters.city) {
    q = q.ilike("city", filters.city);
  }
  if (filters.travelOnly) q = q.eq("available_for_travel", true);
  if (filters.availableOnly) q = q.eq("is_available", true);

  const { data, error } = await q;
  if (error) throw error;
  let rows = (data ?? []).map(normalize);

  if (filters.q) {
    const needle = filters.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        (r.profile?.full_name ?? "").toLowerCase().includes(needle) ||
        (r.city ?? "").toLowerCase().includes(needle) ||
        (r.country ?? "").toLowerCase().includes(needle) ||
        r.specializations.some((s) => s.toLowerCase().includes(needle)),
    );
  }
  if (filters.maxHourly != null) {
    rows = rows.filter((r) => (r.pricing?.hourly_rate ?? 0) <= filters.maxHourly!);
  }
  if (filters.minHourly != null) {
    rows = rows.filter((r) => (r.pricing?.hourly_rate ?? 0) >= filters.minHourly!);
  }
  return rows;
}

export type PhotographerDetail = PhotographerListItem & {
  instagram_handle: string | null;
  whatsapp_number: string | null;
  website_url: string | null;
  pricing_full: {
    currency: string;
    hourly_rate: number | null;
    half_day_rate: number | null;
    full_day_rate: number | null;
    custom_project_available: boolean;
    custom_project_note: string | null;
  } | null;
  portfolio: Array<{ id: string; public_url: string; caption: string | null; display_order: number }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    shoot_type: string | null;
    created_at: string;
    client: { full_name: string | null } | null;
  }>;
};

export async function getPhotographer(id: string): Promise<PhotographerDetail | null> {
  const { data, error } = await supabase
    .from("photographer_profiles")
    .select(
      `
      id, user_id, bio, years_experience, specializations,
      is_available, available_for_travel, city, country,
      rating, total_reviews, is_published,
      instagram_handle, whatsapp_number, website_url,
      profile:profiles!photographer_profiles_user_id_fkey ( full_name, avatar_url, is_verified ),
      pricing ( currency, hourly_rate, half_day_rate, full_day_rate, custom_project_available, custom_project_note ),
      portfolio_items ( id, public_url, caption, display_order ),
      reviews ( id, rating, comment, shoot_type, created_at, client:profiles!reviews_client_id_fkey ( full_name ) )
    `,
    )
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const base = normalize({ ...data, pricing: Array.isArray(data.pricing) ? data.pricing[0] : data.pricing });
  const pricingRow = Array.isArray(data.pricing) ? data.pricing[0] : (data as any).pricing;


  return {
    ...base,
    instagram_handle: (data as any).instagram_handle,
    whatsapp_number: (data as any).whatsapp_number,
    website_url: (data as any).website_url,
    pricing_full: pricingRow ?? null,
    portfolio: ((data as any).portfolio_items ?? [])
      .slice()
      .sort((a: any, b: any) => a.display_order - b.display_order),
    reviews: ((data as any).reviews ?? [])
      .slice()
      .sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at)),
  };
}
