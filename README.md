 PLANET PLUTO 

An Anime tracking website built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, and the **AniList GraphQL API**.

- **Supabase Authentication & Security**:
  - Sign up, login, and sign out using `@supabase/ssr`.
  - Next.js 16 `proxy.ts` (middleware) handling automatic session refresh and protected route guards (`/dashboard`, `/profile`).
  - Full PostgreSQL Row Level Security (RLS) policies.
  - Database trigger automatically populating `profiles` upon user signup in `auth.users`.

- **AniList GraphQL Integration & Caching**:
  - Rate-limit resilient client (`90 requests/minute` ceiling with `Retry-After` retry logic).
  - Next.js Server-Side Data Cache (`revalidate: 3600`) to deduplicate requests across users.
  - Search proxy route (`/api/search`) with client-side query caching via TanStack Query.


## Getting Started


### 1. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
