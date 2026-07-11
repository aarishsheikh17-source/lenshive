DO $$
DECLARE
  u1 uuid := gen_random_uuid();
  u2 uuid := gen_random_uuid();
  u3 uuid := gen_random_uuid();
  u4 uuid := gen_random_uuid();
  u5 uuid := gen_random_uuid();
  u6 uuid := gen_random_uuid();
  u7 uuid := gen_random_uuid();
  u8 uuid := gen_random_uuid();
  p1 uuid; p2 uuid; p3 uuid; p4 uuid;
  p5 uuid; p6 uuid; p7 uuid; p8 uuid;
BEGIN

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES
  (u1, 'aryan.mehta@seed.lenshire.in', crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"full_name":"Aryan Mehta","user_type":"photographer"}'),
  (u2, 'priya.sharma@seed.lenshire.in', crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"full_name":"Priya Sharma","user_type":"photographer"}'),
  (u3, 'karan.nair@seed.lenshire.in', crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"full_name":"Karan Nair","user_type":"photographer"}'),
  (u4, 'zara.khan@seed.lenshire.in', crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"full_name":"Zara Khan","user_type":"photographer"}'),
  (u5, 'rohan.verma@seed.lenshire.in', crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"full_name":"Rohan Verma","user_type":"photographer"}'),
  (u6, 'dev.kapoor@seed.lenshire.in', crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"full_name":"Dev Kapoor","user_type":"photographer"}'),
  (u7, 'nikhil.raj@seed.lenshire.in', crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"full_name":"Nikhil Raj","user_type":"photographer"}'),
  (u8, 'aisha.patel@seed.lenshire.in', crypt('seed_pass_123', gen_salt('bf')), now(), now(), now(), '{"full_name":"Aisha Patel","user_type":"photographer"}')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET city = 'Mumbai', country = 'India', is_verified = true WHERE id = u1;
UPDATE public.profiles SET city = 'Delhi', country = 'India', is_verified = true WHERE id = u2;
UPDATE public.profiles SET city = 'Bangalore', country = 'India', is_verified = true WHERE id = u3;
UPDATE public.profiles SET city = 'Dubai', country = 'UAE', is_verified = true WHERE id = u4;
UPDATE public.profiles SET city = 'Udaipur', country = 'India', is_verified = false WHERE id = u5;
UPDATE public.profiles SET city = 'Jaipur', country = 'India', is_verified = false WHERE id = u6;
UPDATE public.profiles SET city = 'Chennai', country = 'India', is_verified = true WHERE id = u7;
UPDATE public.profiles SET city = 'London', country = 'UK', is_verified = true WHERE id = u8;

INSERT INTO public.photographer_profiles (user_id, bio, years_experience, instagram_handle, whatsapp_number, specializations, is_available, available_for_travel, city, country, rating, total_reviews, is_published)
VALUES
  (u1, 'Cinematic reel and brand photographer with 6 years of experience. Worked with 200+ influencers and D2C brands across Mumbai and Pune. My style is bold, dynamic and story-driven.', '6 years', 'aryanmehta_lens', '919876500001', ARRAY['Reels','Events','Brand','Portrait'], true, true, 'Mumbai', 'India', 4.9, 87, true),
  (u2, 'Wedding and destination photographer with 8+ years capturing love stories across North India. I believe every wedding has its own magic — I document it authentically.', '8 years', 'priyasharma.photo', '919876500002', ARRAY['Wedding','Portrait','Travel','Events'], true, true, 'Delhi', 'India', 5.0, 143, true),
  (u3, 'E-commerce and brand photography specialist. Work featured in campaigns for 50+ startups and D2C brands. Commercial eye meets creative energy.', '5 years', 'karannairphoto', '919876500003', ARRAY['Brand','Product','Corporate','Events'], true, false, 'Bangalore', 'India', 4.8, 61, true),
  (u4, 'Fashion and luxury lifestyle photographer based in Dubai, available globally. Shot editorial campaigns across UAE, India, and Europe.', '7 years', 'zarakhan.visuals', '971500000004', ARRAY['Fashion','Reels','Events','Portrait'], true, true, 'Dubai', 'UAE', 4.9, 74, true),
  (u5, 'Heritage, travel, and architecture photographer based in Rajasthan. Specialist in palace destination weddings and architectural documentation.', '4 years', 'rohanverma_raj', '919876500005', ARRAY['Travel','Architecture','Wedding','Portrait'], true, true, 'Udaipur', 'India', 4.7, 39, true),
  (u6, 'Specialist in pre-wedding, haldi, and mehndi ceremony photography. Vibrant, colourful style that celebrates the joy of Indian weddings.', '3 years', 'devkapoor_clicks', '919876500006', ARRAY['Wedding','Portrait','Events','Reels'], false, true, 'Jaipur', 'India', 4.6, 28, true),
  (u7, 'Automotive and commercial photographer. From luxury car launches to editorial campaigns, I make machines look alive.', '6 years', 'nikhilraj_auto', '919876500007', ARRAY['Product','Brand','Events','Architecture'], true, false, 'Chennai', 'India', 4.9, 44, true),
  (u8, 'London-based creative photographer specialising in editorial portraits, corporate identity, and cultural events. Available across the UK and Europe.', '9 years', 'aishapatelphoto', '447700000008', ARRAY['Portrait','Events','Brand','Fashion'], true, true, 'London', 'UK', 4.8, 52, true)
ON CONFLICT DO NOTHING;

SELECT id INTO p1 FROM public.photographer_profiles WHERE user_id = u1;
SELECT id INTO p2 FROM public.photographer_profiles WHERE user_id = u2;
SELECT id INTO p3 FROM public.photographer_profiles WHERE user_id = u3;
SELECT id INTO p4 FROM public.photographer_profiles WHERE user_id = u4;
SELECT id INTO p5 FROM public.photographer_profiles WHERE user_id = u5;
SELECT id INTO p6 FROM public.photographer_profiles WHERE user_id = u6;
SELECT id INTO p7 FROM public.photographer_profiles WHERE user_id = u7;
SELECT id INTO p8 FROM public.photographer_profiles WHERE user_id = u8;

INSERT INTO public.pricing (photographer_id, currency, hourly_rate, half_day_rate, full_day_rate, custom_project_available, custom_project_note)
VALUES
  (p1, '₹', 3500, 12000, 20000, true, 'Custom reels packages available for brands and influencers. Minimum 3-hour booking.'),
  (p2, '₹', 4200, 15000, 28000, true, 'Destination wedding packages available. Travel costs billed separately.'),
  (p3, '₹', 5000, 18000, 32000, true, 'E-commerce bulk packages available for 50+ products.'),
  (p4, 'AED', 450, 1500, 2800, true, 'International travel available. Minimum half-day booking for travel projects.'),
  (p5, '₹', 2800, 9000, 16000, true, 'Heritage and palace shoot packages available. Local travel included.'),
  (p6, '₹', 2500, 8000, 14000, false, null),
  (p7, '₹', 5500, 19000, 35000, true, 'Car launch and automotive campaign packages. Studio hire separate.'),
  (p8, '£', 120, 400, 750, true, 'Corporate identity packages available. UK travel included.');

INSERT INTO public.portfolio_items (photographer_id, storage_path, public_url, caption, display_order)
VALUES
  (p1, 'seed/p1/1.jpg', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800', 'Brand shoot for a D2C startup', 1),
  (p1, 'seed/p1/2.jpg', 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800', 'Instagram reel content shoot', 2),
  (p1, 'seed/p1/3.jpg', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800', 'Corporate event coverage', 3),
  (p1, 'seed/p1/4.jpg', 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?w=800', 'Fashion reel session', 4),
  (p1, 'seed/p1/5.jpg', 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800', 'Product launch event', 5),
  (p1, 'seed/p1/6.jpg', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800', 'Lifestyle brand shoot', 6),

  (p2, 'seed/p2/1.jpg', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', 'Wedding ceremony', 1),
  (p2, 'seed/p2/2.jpg', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'Bride portrait', 2),
  (p2, 'seed/p2/3.jpg', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', 'Golden hour couple', 3),
  (p2, 'seed/p2/4.jpg', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', 'Reception candids', 4),
  (p2, 'seed/p2/5.jpg', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', 'Destination wedding setup', 5),
  (p2, 'seed/p2/6.jpg', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800', 'Pre-wedding shoot', 6),

  (p3, 'seed/p3/1.jpg', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'Luxury watch product shoot', 1),
  (p3, 'seed/p3/2.jpg', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800', 'Sneaker campaign', 2),
  (p3, 'seed/p3/3.jpg', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800', 'Beauty product shoot', 3),
  (p3, 'seed/p3/4.jpg', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800', 'Tech product campaign', 4),
  (p3, 'seed/p3/5.jpg', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800', 'E-commerce catalogue shoot', 5),
  (p3, 'seed/p3/6.jpg', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800', 'Brand identity shoot', 6),

  (p4, 'seed/p4/1.jpg', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', 'Dubai fashion editorial', 1),
  (p4, 'seed/p4/2.jpg', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', 'Luxury lifestyle shoot', 2),
  (p4, 'seed/p4/3.jpg', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800', 'Fashion week coverage', 3),
  (p4, 'seed/p4/4.jpg', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800', 'Influencer content creation', 4),

  (p5, 'seed/p5/1.jpg', 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', 'Udaipur palace wedding', 1),
  (p5, 'seed/p5/2.jpg', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'Heritage architecture', 2),
  (p5, 'seed/p5/3.jpg', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Rajasthan landscape', 3),
  (p5, 'seed/p5/4.jpg', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', 'City architecture', 4),

  (p6, 'seed/p6/1.jpg', 'https://images.unsplash.com/photo-1601128533718-374ffcca299b?w=800', 'Haldi ceremony', 1),
  (p6, 'seed/p6/2.jpg', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 'Mehndi celebration', 2),
  (p6, 'seed/p6/3.jpg', 'https://images.unsplash.com/photo-1617450365226-9bf28c04e130?w=800', 'Wedding festivities', 3),

  (p7, 'seed/p7/1.jpg', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', 'Luxury car shoot', 1),
  (p7, 'seed/p7/2.jpg', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800', 'Automotive editorial', 2),
  (p7, 'seed/p7/3.jpg', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'Car launch event', 3),
  (p7, 'seed/p7/4.jpg', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 'Brand campaign', 4),

  (p8, 'seed/p8/1.jpg', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', 'Editorial portrait London', 1),
  (p8, 'seed/p8/2.jpg', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'Corporate headshot', 2),
  (p8, 'seed/p8/3.jpg', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=800', 'Creative portrait', 3),
  (p8, 'seed/p8/4.jpg', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800', 'Fashion portrait', 4);

END $$;