-- Supabase Seed Data (supabase/seed.sql)
-- Seed dataset for development containing genres, categories, languages, countries, demo published movies, and a demo published series.

-- 1. Languages
INSERT INTO public.languages (id, code, name, name_bn) VALUES
  ('11111111-0000-0000-0000-000000000001', 'bn', 'Bengali', 'বাংলা'),
  ('11111111-0000-0000-0000-000000000002', 'en', 'English', 'ইংরেজি')
ON CONFLICT (code) DO NOTHING;

-- 2. Countries
INSERT INTO public.countries (id, code, name, name_bn) VALUES
  ('22222222-0000-0000-0000-000000000001', 'BD', 'Bangladesh', 'বাংলাদেশ'),
  ('22222222-0000-0000-0000-000000000002', 'IN', 'India', 'ভারত'),
  ('22222222-0000-0000-0000-000000000003', 'US', 'United States', 'যুক্তরাষ্ট্র')
ON CONFLICT (code) DO NOTHING;

-- 3. Genres
INSERT INTO public.genres (id, slug, name, name_bn, description) VALUES
  ('33333333-0000-0000-0000-000000000001', 'action', 'Action', 'অ্যাকশন', 'High-adrenaline action blockbusters'),
  ('33333333-0000-0000-0000-000000000002', 'drama', 'Drama', 'নাটক', 'Emotional and character-driven drama'),
  ('33333333-0000-0000-0000-000000000003', 'thriller', 'Mystery & Thriller', 'থ্রিলার', 'Suspenseful mystery and thriller blockbusters'),
  ('33333333-0000-0000-0000-000000000004', 'comedy', 'Comedy', 'কমেডি', 'Lighthearted comedy and laughter'),
  ('33333333-0000-0000-0000-000000000005', 'bengali-classics', 'Bengali Classics', 'বাংলা ক্লাসিক', 'Timeless Bengali classic masterpieces'),
  ('33333333-0000-0000-0000-000000000006', 'romance', 'Romance', 'রোমান্স', 'Romantic love stories')
ON CONFLICT (slug) DO NOTHING;

-- 4. Categories
INSERT INTO public.categories (id, slug, name, description, sort_order) VALUES
  ('44444444-0000-0000-0000-000000000001', 'featured', 'Featured Spotlight', 'Hero spotlight titles', 1),
  ('44444444-0000-0000-0000-000000000002', 'trending', 'Trending Now', 'Most watched titles across Bangladesh', 2),
  ('44444444-0000-0000-0000-000000000003', 'bengali-originals', 'Bengali Originals', 'Exclusive FLEX original productions', 3),
  ('44444444-0000-0000-0000-000000000004', 'top-10', 'Top 10 in Bangladesh', 'Current top 10 movies and series', 4)
ON CONFLICT (slug) DO NOTHING;

-- 5. Demo Movies
INSERT INTO public.movies (
  id, title, title_bn, slug, status, original_title, release_year, duration_minutes,
  description, description_bn, tagline, rating, content_rating, original_language_id, country_id,
  aliases, search_keywords, external_ids, media, published_at
) VALUES
  (
    '55555555-0000-0000-0000-000000000001',
    'Hawa', 'হাওয়া', 'hawa-2022', 'published', 'Hawa', 2022, 131,
    'A group of fishermen find a mysterious woman caught in their fishing net in the deep ocean.',
    'গভীর সমুদ্রে মাছ ধরার জালে এক রহস্যময় নারীকে পায় একদল জেলে।',
    'Mystery of the Deep Seas', 8.4, '15+',
    '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
    '["Hawa Movie", "Hawa Bangla"]'::jsonb,
    'hawa hawa bangla movie mystery ocean chanchal chowdhury',
    '{"imdb": "tt11082260"}'::jsonb,
    '{"posterUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600", "backdropUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200"}'::jsonb,
    NOW()
  ),
  (
    '55555555-0000-0000-0000-000000000002',
    'Surung', 'সুড়ঙ্গ', 'surung-2023', 'published', 'Surung', 2023, 150,
    'A desperate man digs a tunnel to pull off a daring bank heist in pursuit of wealth.',
    'ভাগ্যের চাকা ঘোরাতে এক নিঃস্ব মানুষ ব্যাংক ডাকাতির জন্য সুড়ঙ্গ খোঁড়ে।',
    'Digging for Destiny', 8.2, '15+',
    '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
    '["Surongo", "Shurong"]'::jsonb,
    'surung surongo shurong bank heist thriller afran nisho bangla',
    '{"imdb": "tt27914838"}'::jsonb,
    '{"posterUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600", "backdropUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"}'::jsonb,
    NOW()
  ),
  (
    '55555555-0000-0000-0000-000000000003',
    'Monpura', 'মনপুরা', 'monpura-2009', 'published', 'Monpura', 2009, 140,
    'A tragic romantic saga set in an isolated riverine island of rural Bangladesh.',
    'বাংলাদেশের গ্রামীণ চরাঞ্চলে এক ট্র্যাজিক প্রেমের উপাখ্যান।',
    'Eternal Love on the Island', 8.6, 'PG',
    '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
    '["Monpura Film"]'::jsonb,
    'monpura classic romance chanchal chowdhury bangla movie bhalobasha',
    '{"imdb": "tt1467000"}'::jsonb,
    '{"posterUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600", "backdropUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200"}'::jsonb,
    NOW()
  ),
  (
    '55555555-0000-0000-0000-000000000004',
    'Pather Panchali', 'পথের পাঁচালী', 'pather-panchali-1955', 'published', 'Pather Panchali', 1955, 125,
    'Satyajit Ray classic masterpiece following young Apu growing up in rural Bengal.',
    'গ্রামীণ বাংলায় অপু ও দুর্গার বেড়ে ওঠার কালজয়ী বাংলা চলচ্চিত্র।',
    'Song of the Little Road', 9.2, 'G',
    '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002',
    '["Song of the Little Road"]'::jsonb,
    'pather panchali satyajit ray apu classic bangla film cinema',
    '{"imdb": "tt0048473"}'::jsonb,
    '{"posterUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600", "backdropUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200"}'::jsonb,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- Movie Genres Mapping
INSERT INTO public.movie_genres (movie_id, genre_id) VALUES
  ('55555555-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000003'),
  ('55555555-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001'),
  ('55555555-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000003'),
  ('55555555-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000002'),
  ('55555555-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000006'),
  ('55555555-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

-- Movie Categories Mapping
INSERT INTO public.movie_categories (movie_id, category_id) VALUES
  ('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001'),
  ('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000002'),
  ('55555555-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002'),
  ('55555555-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 6. Demo Series
INSERT INTO public.series (
  id, title, title_bn, slug, status, original_title, release_year,
  description, description_bn, tagline, rating, content_rating, original_language_id, country_id,
  aliases, search_keywords, external_ids, media, published_at
) VALUES
  (
    '66666666-0000-0000-0000-000000000001',
    'Karagar', 'কারাগার', 'karagar-2022', 'published', 'Karagar', 2022,
    'A mysterious prisoner appears in Cell No 14 of Akashpur Central Jail, locked for 50 years.',
    'আকাশপুর কেন্দ্রীয় কারাগারের ৫০ বছর ধরে বন্ধ ১৪ নম্বর সেলে হঠাৎ এক রহস্যময় কয়েদীর আবির্ভাব।',
    'The Mystery of Cell 14', 8.8, '15+',
    '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
    '["Karagar Web Series"]'::jsonb,
    'karagar karagor jail mystery thriller chanchal chowdhury bangla series',
    '{"imdb": "tt21817102"}'::jsonb,
    '{"posterUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600", "backdropUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200"}'::jsonb,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- Demo Season
INSERT INTO public.seasons (id, series_id, season_number, title, description, status, published_at) VALUES
  (
    '77777777-0000-0000-0000-000000000001',
    '66666666-0000-0000-0000-000000000001', 1, 'Season 1', 'Part 1: The Arrival', 'published', NOW()
  )
ON CONFLICT (series_id, season_number) DO NOTHING;

-- Demo Episodes
INSERT INTO public.episodes (id, season_id, episode_number, title, title_bn, description, duration_minutes, status, published_at) VALUES
  (
    '88888888-0000-0000-0000-000000000001',
    '77777777-0000-0000-0000-000000000001', 1, 'Cell No 14', '১৪ নম্বর সেল', 'A man claims he has been imprisoned for 250 years.', 28, 'published', NOW()
  ),
  (
    '88888888-0000-0000-0000-000000000002',
    '77777777-0000-0000-0000-000000000001', 2, 'The Interrogation', 'জিজ্ঞাসাবাদ', 'Interrogation begins as historic events line up.', 31, 'published', NOW()
  ),
  (
    '88888888-0000-0000-0000-000000000003',
    '77777777-0000-0000-0000-000000000001', 3, 'The Executioner', 'ঘাতক', 'Unraveling past memories of French Revolution.', 34, 'published', NOW()
  )
ON CONFLICT (season_id, episode_number) DO NOTHING;
