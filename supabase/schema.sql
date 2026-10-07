-- Schema migration for Social Media Platform (Twitter/X Clone)

-- 1. Profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text default '',
  avatar_url text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Posts table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content varchar(280) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Likes table
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint unique_post_user_like unique (post_id, user_id)
);

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- 6. Profiles policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

-- 7. Posts policies
create policy "Posts are viewable by everyone." on public.posts for select using (true);
create policy "Authenticated users can insert posts." on public.posts for insert with check (auth.uid() = user_id);
create policy "Authors can update their own posts." on public.posts for update using (auth.uid() = user_id);
create policy "Authors can delete their own posts." on public.posts for delete using (auth.uid() = user_id);

-- 8. Comments policies
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Authenticated users can insert comments." on public.comments for insert with check (auth.uid() = user_id);
create policy "Authors can update their own comments." on public.comments for update using (auth.uid() = user_id);
create policy "Authors can delete their own comments." on public.comments for delete using (auth.uid() = user_id);

-- 9. Likes policies
create policy "Likes are viewable by everyone." on public.likes for select using (true);
create policy "Authenticated users can insert likes." on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes." on public.likes for delete using (auth.uid() = user_id);

-- 10. Trigger to auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', coalesce(new.raw_user_meta_data->>'username', 'User')),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'bio', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
