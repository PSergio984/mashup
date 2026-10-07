# Social Media Platform Specification (Twitter/X Clone)

## Problem Statement

Users need a lightweight, responsive social platform where they can quickly broadcast short updates, engage in conversations through threaded comments, appreciate community posts with likes, maintain a distinct public identity through a profile wall, and manage their own content with complete ownership. Existing large platforms are overly complex, noisy, and feature-heavy for focused community microblogging.

## Solution

A fast, responsive web application inspired by Twitter/X built with Next.js, TypeScript, and Supabase. It offers instant user registration and session management, a centralized reverse-chronological public timeline, micro-post creation (up to 280 characters), inline and dedicated comment threads, instant one-click like interactions, author-governed post and comment deletion with cascading integrity, and a customizable user profile wall.

## User Stories

### Authentication & Account Management
1. As a new user, I want to sign up with a unique username, display name, email, and password, so that I can establish my identity on the platform.
2. As a new user, I want to be logged in immediately upon registration without email verification delays, so that I can start sharing updates without friction.
3. As a returning user, I want to log in using my email and password, so that I can access my account from any device.
4. As an authenticated user, I want my login session to persist securely across browser refreshes, so that I do not have to sign in repeatedly.
5. As an authenticated user, I want to log out securely, so that my account is protected on shared computers.
6. As a guest user, I want to be prompted to log in when attempting to post, like, or comment, so that platform integrity and identity attribution are maintained.

### Home Feed & Post Creation
7. As an authenticated user, I want to see a compose box at the top of the feed, so that I can easily draft and publish a new post.
8. As a user drafting a post, I want a live character counter showing remaining characters up to 280, so that I can keep my updates concise.
9. As a user drafting a post, I want the submit action to be disabled if the content is empty or exceeds 280 characters, so that invalid posts cannot be published.
10. As a user, I want newly created posts to appear immediately at the top of the feed, so that I get immediate confirmation of publication.
11. As a reader, I want to scroll through a global public feed showing all posts in reverse-chronological order, so that I can stay up to date with community conversations.
12. As a reader, I want each post card to clearly show the author's display name, username handle, avatar initials, relative creation timestamp, and text content.

### Post Interactions (Likes & Comments)
13. As an authenticated user, I want to like a post with a single click, so that I can show appreciation for the author's thoughts.
14. As an authenticated user, I want to unlike a post I previously liked, so that I can retract my like if I change my mind.
15. As a user liking or unliking a post, I want optimistic UI updates, so that the like button and counter react immediately without network latency.
16. As a reader, I want each post card to display the aggregate count of likes and comments, so that I can gauge community engagement.
17. As a reader, I want to expand an inline comments drawer directly beneath any post card on the feed, so that I can read replies without leaving the timeline.
18. As an authenticated user, I want to write and submit a comment directly inside the inline comments drawer, so that I can participate in the discussion quickly.
19. As a reader, I want to click into a dedicated post detail page (`/posts/[id]`), so that I can view the focused post alongside its full comment thread.
20. As a reader, I want to see comments listed chronologically with author initials, handle, timestamp, and content.

### Content Ownership & Deletion
21. As a post author, I want to see a delete action on my own posts, so that I can remove updates I no longer wish to share.
22. As a post author, I want a confirmation step before a post is deleted, so that I do not accidentally lose content.
23. As a post author, I want deleting my post to cascade and remove all associated likes and comments, so that orphaned records do not linger in the system.
24. As a user, I want to never see delete controls on posts created by other users, so that unauthorized deletions are visually and technically prevented.
25. As a comment author, I want to delete my own comments, so that I can remove remarks I no longer endorse.

### User Profiles & Wall
26. As a user, I want to visit any user's public profile page via their handle (`/profile/[username]`), so that I can explore their personal wall and background.
27. As a profile visitor, I want to see the user's avatar initials, display name, handle, bio, join date, and total post count.
28. As a profile visitor, I want to view a dedicated wall showing only posts authored by that specific user in reverse-chronological order.
29. As an authenticated user viewing my own profile, I want to see an "Edit Profile" button, so that I can customize my public identity.
30. As a profile owner, I want to open an edit modal to modify my display name and bio, so that I can keep my information fresh.
31. As a user viewing another user's profile, I want the "Edit Profile" controls to be hidden, so that only account owners can modify their profiles.

## Implementation Decisions

### Architectural Decisions
- **Unified Full-Stack Framework:** Next.js App Router with TypeScript. Server Components handle initial data fetching for SEO and fast first render; Client Components handle optimistic interactive states (likes, composer, inline comments, modal toggles).
- **Backend & Database:** Supabase PostgreSQL instance with Row Level Security (RLS) enabled on all public tables.
- **Session Layer:** `@supabase/ssr` utilizing encrypted HTTP-only cookie storage for secure SSR session hydration and middleware route protection.
- **Design System & Layout:** Three-column responsive Twitter/X architecture (navigation sidebar, central scrollable timeline, contextual user widget / trends placeholder), built with Tailwind CSS and Lucide icons.

### Data Model & Schema Contracts

```sql
-- Profiles table linked to auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text default '',
  avatar_url text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content varchar(280) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint unique_post_user_like unique (post_id, user_id)
);
```

### Module Boundaries
- **Auth Module:** Manages login, registration, logout, session restoration, and sync between `auth.users` and `public.profiles`.
- **Feed & Post Module:** Manages timeline retrieval, post composition, character validation, and author-authorized deletion.
- **Engagement Module:** Manages like toggling, aggregated engagement metrics, comment thread retrieval, comment creation, and comment removal.
- **Profile Module:** Manages public profile data resolution by username, author post filtering, and profile metadata updates.

## Testing Decisions

### What Makes a Good Test
Tests should verify externally observable behavior and contract fulfillment rather than implementation details:
- Assert that valid inputs succeed and persist expected state.
- Assert that unauthorized users cannot mutate another user's content.
- Assert that cascading constraints clean up child dependencies.
- Assert that validation errors (e.g. empty content, character limits > 280) return appropriate client rejections.

### Modules Tested
- **Post & Feed Service:** Creation, character bounds validation, deletion, and chronological order.
- **Engagement Service:** Like idempotency, unlike removal, comment creation, and comment cascade upon post deletion.
- **Profile Service:** Retrieval by username handle and authorized profile updates.

### Proposed Primary Testing Seam
- **The Application Service / Action Seam:** Test at the boundary of Server Actions and Supabase Data Access functions. This provides a single, high-level seam that validates full business logic, permission rules, and data persistence contracts end-to-end without testing internal component state or mocking low-level database drivers.

## Out of Scope
- Image and video file uploads (text-only posts in initial scope).
- Follow / Unfollow social graph relationships.
- Direct messaging (DMs) between users.
- Hashtag indexing, algorithmic trending topics, and full-text search.
- Email verification requirement upon signup (immediate login enabled for development efficiency).
- Retweet / Repost functionality.

## Further Notes
- Supabase project will be created in organization `PSergio984's Org` using the Supabase MCP.
- The schema will include automated triggers to populate `public.profiles` when a user signs up.
- Responsive breakpoints ensure smooth usability on mobile screens with bottom bar navigation.
