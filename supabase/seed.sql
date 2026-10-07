-- Seed mock test data for Mashup Social Media Platform

create extension if not exists pgcrypto;

-- 1. Insert Demo Auth Users
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'alex@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"alex_rivera","display_name":"Alex Rivera"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b2222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'sarah@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"sarah_codes","display_name":"Sarah Chen"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'c3333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'tech@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"tech_insider","display_name":"Tech Insider"}',
    now(),
    now()
  )
on conflict (id) do nothing;

-- 2. Update Profile Bios
update public.profiles set bio = 'Fullstack engineer building with Next.js & TypeScript. ☕' where id = 'a1111111-1111-1111-1111-111111111111';
update public.profiles set bio = 'Design systems, UI/UX, and CSS magic. Building the web.' where id = 'b2222222-2222-2222-2222-222222222222';
update public.profiles set bio = 'Daily snippets and discussions on software architecture.' where id = 'c3333333-3333-3333-3333-333333333333';

-- 3. Insert Realistic Feed Posts
insert into public.posts (id, user_id, content, created_at)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Just deployed the new Twitter clone built with Next.js 15 and Supabase! The latency on Server Actions feels snappy. What stack are you using today?',
    now() - interval '2 hours'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'Clean typography and generous whitespace make all the difference in modern social feeds. Keeping posts text-only really brings back the early microblogging vibe.',
    now() - interval '1 hour'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'Pro tip: Test your application boundaries at the Server Action / Service Seam rather than testing UI internals. Saves hours during refactors.',
    now() - interval '30 minutes'
  )
on conflict (id) do nothing;

-- 4. Insert Threaded Comments
insert into public.comments (id, post_id, user_id, content, created_at)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'Next.js 15 with App Router is a game changer! Loving the performance.',
    now() - interval '1 hour 45 minutes'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '11111111-1111-1111-1111-111111111111',
    'c3333333-3333-3333-3333-333333333333',
    'Great work! Does it support real-time likes as well?',
    now() - interval '1 hour 20 minutes'
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    'a1111111-1111-1111-1111-111111111111',
    '100% agreed on testing seams. TDD at service boundaries is bulletproof.',
    now() - interval '15 minutes'
  )
on conflict (id) do nothing;

-- 5. Insert Initial Likes
insert into public.likes (id, post_id, user_id)
values
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222'),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333'),
  ('55555555-5555-5555-5555-555555555553', '22222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111')
on conflict (post_id, user_id) do nothing;
