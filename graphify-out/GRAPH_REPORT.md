# Graph Report - mashup  (2026-10-07)

## Corpus Check
- 37 files · ~10,243 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 174 nodes · 320 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b74d6c3b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- compilerOptions
- [username]/page.tsx
- dependencies
- devDependencies
- getCurrentUser
- auth.ts
- posts.ts
- scripts
- src/middleware.ts
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `AuthUser` - 16 edges
2. `compilerOptions` - 16 edges
3. `getCurrentUser()` - 9 edges
4. `scripts` - 7 edges
5. `UserAvatar()` - 7 edges
6. `PostWithDetails` - 7 edges
7. `signIn()` - 6 edges
8. `signOut()` - 6 edges
9. `CommentsSection()` - 6 edges
10. `PostCard()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `MobileNavProps` --references--> `AuthUser`  [EXTRACTED]
  src/components/MobileNav.tsx → src/lib/types.ts
- `PostComposerProps` --references--> `AuthUser`  [EXTRACTED]
  src/components/PostComposer.tsx → src/lib/types.ts
- `LoginPage()` --calls--> `signIn()`  [EXTRACTED]
  src/app/login/page.tsx → src/actions/auth.ts
- `RootLayout()` --calls--> `getCurrentUser()`  [EXTRACTED]
  src/app/layout.tsx → src/actions/auth.ts
- `HomePage()` --calls--> `getCurrentUser()`  [EXTRACTED]
  src/app/page.tsx → src/actions/auth.ts

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.16
Nodes (22): createComment(), deleteComment(), getCommentsForPost(), toggleLike(), CommentsSection(), loadComments(), CommentsSectionProps, PostCard() (+14 more)

### Community 1 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 2 - "[username]/page.tsx"
Cohesion: 0.20
Nodes (12): getUserPosts(), getProfileByUsername(), updateProfile(), ProfilePage(), ProfilePageProps, revalidate, EditProfileModal(), EditProfileModalProps (+4 more)

### Community 3 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, lucide-react, next, dependencies, clsx, lucide-react, next, react (+9 more)

### Community 4 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, postcss, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+9 more)

### Community 5 - "getCurrentUser"
Cohesion: 0.21
Nodes (11): getCurrentUser(), signOut(), getPostById(), metadata, RootLayout(), PostDetailPage(), PostPageProps, revalidate (+3 more)

### Community 6 - "auth.ts"
Cohesion: 0.33
Nodes (7): signIn(), signUp(), LoginPage(), RegisterPage(), RegisterInput, validateRegistration(), validateUsername()

### Community 7 - "posts.ts"
Cohesion: 0.28
Nodes (9): createPost(), deletePost(), getFeedPosts(), HomePage(), revalidate, PostComposer(), PostComposerProps, PostFeedClient() (+1 more)

### Community 8 - "scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, start, test (+2 more)

### Community 9 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

## Knowledge Gaps
- **58 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+53 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `AuthUser` connect `types.ts` to `[username]/page.tsx`, `getCurrentUser`, `auth.ts`, `posts.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _58 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._