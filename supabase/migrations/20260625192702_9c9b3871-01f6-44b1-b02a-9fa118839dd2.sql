
-- =========================================
-- ENUMS / EXTENSIONS
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- updated_at helper
-- =========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- profiles
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('photographer','client')),
  avatar_url TEXT,
  city TEXT,
  country TEXT DEFAULT 'India',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- photographer_profiles
-- =========================================
CREATE TABLE public.photographer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  years_experience TEXT,
  instagram_handle TEXT,
  website_url TEXT,
  whatsapp_number TEXT,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  available_for_travel BOOLEAN NOT NULL DEFAULT false,
  city TEXT,
  country TEXT DEFAULT 'India',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  profile_views INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photog_published ON public.photographer_profiles(is_published) WHERE is_published = true;
CREATE INDEX idx_photog_city ON public.photographer_profiles(city);
CREATE INDEX idx_photog_specs ON public.photographer_profiles USING GIN(specializations);

GRANT SELECT ON public.photographer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photographer_profiles TO authenticated;
GRANT ALL ON public.photographer_profiles TO service_role;

ALTER TABLE public.photographer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published photographer profiles are public"
  ON public.photographer_profiles FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Photographers can insert their own profile"
  ON public.photographer_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Photographers can update their own profile"
  ON public.photographer_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Photographers can delete their own profile"
  ON public.photographer_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_photog_updated_at
  BEFORE UPDATE ON public.photographer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- pricing
-- =========================================
CREATE TABLE public.pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL UNIQUE REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT '₹',
  hourly_rate NUMERIC(10,2),
  half_day_rate NUMERIC(10,2),
  full_day_rate NUMERIC(10,2),
  custom_project_available BOOLEAN NOT NULL DEFAULT true,
  custom_project_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pricing TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing TO authenticated;
GRANT ALL ON public.pricing TO service_role;

ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing is public"
  ON public.pricing FOR SELECT USING (true);

CREATE POLICY "Photographers manage their own pricing"
  ON public.pricing FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.id = pricing.photographer_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.id = pricing.photographer_id AND p.user_id = auth.uid()));

CREATE TRIGGER trg_pricing_updated_at
  BEFORE UPDATE ON public.pricing
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- portfolio_items
-- =========================================
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  caption TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_photog ON public.portfolio_items(photographer_id, display_order);

GRANT SELECT ON public.portfolio_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT ALL ON public.portfolio_items TO service_role;

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio is public"
  ON public.portfolio_items FOR SELECT USING (true);

CREATE POLICY "Photographers manage their portfolio"
  ON public.portfolio_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.id = portfolio_items.photographer_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.id = portfolio_items.photographer_id AND p.user_id = auth.uid()));

-- =========================================
-- enquiries
-- =========================================
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  shoot_date DATE,
  shoot_type TEXT,
  booking_type TEXT CHECK (booking_type IN ('hourly','half_day','full_day','custom_project')),
  location TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','replied','closed')),
  photographer_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_enquiries_photog ON public.enquiries(photographer_id, created_at DESC);
CREATE INDEX idx_enquiries_client ON public.enquiries(client_id, created_at DESC);

GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an enquiry"
  ON public.enquiries FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Photographer sees their enquiries"
  ON public.enquiries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.id = enquiries.photographer_id AND p.user_id = auth.uid()));

CREATE POLICY "Client sees their own enquiries"
  ON public.enquiries FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Photographer updates their enquiries"
  ON public.enquiries FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.id = enquiries.photographer_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.id = enquiries.photographer_id AND p.user_id = auth.uid()));

-- =========================================
-- reviews
-- =========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  shoot_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_photog ON public.reviews(photographer_id, created_at DESC);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Clients can write reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can edit own reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can delete own reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = client_id);

-- Recalculate photographer rating
CREATE OR REPLACE FUNCTION public.recalculate_photographer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.photographer_id, OLD.photographer_id);
  UPDATE public.photographer_profiles
  SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE photographer_id = pid), 0),
      total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE photographer_id = pid)
  WHERE id = pid;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_photographer_rating();

-- =========================================
-- saved_photographers
-- =========================================
CREATE TABLE public.saved_photographers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES public.photographer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, photographer_id)
);

GRANT SELECT, INSERT, DELETE ON public.saved_photographers TO authenticated;
GRANT ALL ON public.saved_photographers TO service_role;

ALTER TABLE public.saved_photographers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients manage their saved list"
  ON public.saved_photographers FOR ALL TO authenticated
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);

-- =========================================
-- increment_profile_views RPC
-- =========================================
CREATE OR REPLACE FUNCTION public.increment_profile_views(photog_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.photographer_profiles SET profile_views = profile_views + 1 WHERE id = photog_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_profile_views(UUID) TO anon, authenticated;
