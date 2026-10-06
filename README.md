# PLANET PLUTO ⚔️

A high-contrast, Bleach-themed anime tracking web application with Tite Kubo's manga aesthetic, built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, and the **AniList GraphQL API**.

---

## Features

- **Discover Experience (`/`)**:
  - Hero banner featuring the iconic Tite Kubo Bleach color spread with high-contrast editorial typography and quick tracking actions.
  - Dedicated **BLEACH // Sagas & The Soul Society** collection showcasing the entire franchise.
  - Horizontal snap-scrolling carousels for **Trending in the Human World** and **Popular This Season**.
  - Top Rated of All Time masterworks grid.
  - Distinctive **Urbanist** typography paired with a restrained monochromatic palette (no purple/indigo gradients or floating blur lights).

- **Anime Details Page (`/anime/[id]`)**:
  - Full anime metadata: synopsis, banner, airing countdown, genres, duration, studio, source, and YouTube trailer embed.
  - Recommended series row.
  - **Interactive Quick-Add Tracking Widget**:
    - Status selector (`Watching`, `Completed`, `Planning`, `Paused`, `Dropped`).
    - Episode stepper (`-`, direct number input with draft mode, `+`, and `Max` button).
    - Score input with 0.5 step slider and quick 1–10 pills.
    - Automatic status transition: sets to `COMPLETED` when `progress === total_episodes`.
    - Instant optimistic UI updates backed by Supabase Server Actions.

- **User Dashboard (`/dashboard`)**:
  - Tabbed filtering: All, Watching, Completed, Planning, Paused, Dropped.
  - **Grid View** & **Table View** toggle.
  - Inline one-click `+` / `-` episode progress stepper with optimistic UI.
  - Search and sort filters (Recently Updated, Highest Score, Most Watched, Alphabetical).
  - Tracking statistics overview (Total Anime, Episodes Watched, Mean Score, Completed count).
  - Quick inline edit modal (`TrackModal`).

- **Supabase Authentication & Security**:
  - Sign up, login, and sign out using `@supabase/ssr`.
  - Next.js 16 `proxy.ts` (middleware) handling automatic session refresh and protected route guards (`/dashboard`, `/profile`).
  - Full PostgreSQL Row Level Security (RLS) policies.
  - Database trigger automatically populating `profiles` upon user signup in `auth.users`.

- **AniList GraphQL Integration & Caching**:
  - Rate-limit resilient client (`90 requests/minute` ceiling with `Retry-After` retry logic).
  - Next.js Server-Side Data Cache (`revalidate: 3600`) to deduplicate requests across users.
  - Search proxy route (`/api/search`) with client-side query caching via TanStack Query.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Actions, Proxy) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS v4, Lucide Icons, Radix UI Primitives |
| **Database & Auth** | Supabase (PostgreSQL, `@supabase/ssr`, RLS) |
| **External Data** | AniList GraphQL API (`https://graphql.anilist.co`) |
| **Client State** | TanStack Query v5 |

---

## Getting Started

### 1. Setup Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials from your [Supabase Dashboard](https://supabase.com/dashboard) (Project Settings -> API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Apply Database Migration

Run the SQL migration in `supabase/migrations/20261006000000_init_anitrack.sql` inside your Supabase SQL Editor:
- Creates `profiles` and `user_anime_list` tables.
- Sets up Row Level Security (RLS) policies.
- Creates trigger `on_auth_user_created` to sync user profiles automatically.
- Sets up `touch_updated_at` trigger for tracking updates.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
