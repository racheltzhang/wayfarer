# Wayfarer ✦

A social travel app where you share itineraries, discover trips through friends, and build your own adventures — designed with a dark, luxe aesthetic.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Backend | Supabase (Postgres + Auth + Storage) |
| Map | Leaflet.js |
| State | React state + Context |

---

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd wayfarer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the SQL Editor, paste and run the contents of `supabase/schema.sql` — this creates all tables, RLS policies, triggers, and indexes
3. In **Storage**, create a bucket named `trip-photos` (set it to public)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your values from **Supabase → Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # optional, for admin scripts
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
wayfarer/
├── app/
│   ├── (auth)/login/         # Sign-in / sign-up page
│   ├── (main)/               # Authenticated shell with bottom nav
│   │   ├── page.tsx          # Feed (home)
│   │   ├── map/page.tsx      # Map view
│   │   ├── trips/page.tsx    # My trips
│   │   └── create/page.tsx   # Create itinerary
│   ├── trip/[id]/page.tsx    # Trip detail
│   ├── globals.css           # Design tokens + global styles
│   └── layout.tsx            # Root layout
│
├── components/
│   ├── create/
│   │   └── CreateFlow.tsx    # Full create experience (mode picker, day builder, publish)
│   ├── detail/
│   │   └── TripDetail.tsx    # Trip detail view
│   ├── feed/
│   │   ├── FeedHeader.tsx
│   │   ├── FriendStories.tsx
│   │   └── TripCard.tsx
│   ├── map/
│   │   └── MapView.tsx       # Leaflet map (client-only)
│   └── ui/
│       ├── BottomNav.tsx
│       ├── SearchBar.tsx
│       └── Toast.tsx         # Toast context + hook + provider
│
├── lib/
│   ├── mock-data.ts          # Local mock trips, profiles, suggestions
│   ├── types.ts              # TypeScript domain types
│   ├── utils.ts              # cn(), formatRating(), starsFilled()
│   └── supabase/
│       ├── client.ts         # Browser client
│       └── server.ts         # Server / RSC client
│
├── supabase/
│   └── schema.sql            # Full Postgres schema with RLS
│
├── middleware.ts             # Session refresh + auth redirects
└── .env.example
```

---

## Key Features

**Feed** — Scrollable card feed of public trips from people you follow, with like/save actions.

**Map** — Leaflet map with gold pins for each trip location. Tap a pin to preview the trip.

**Trip Detail** — Full view with hero image, author info, rating, photo grid, collapsible day-by-day itinerary, and "Use as Template" CTA.

**Create Flow** — Three-step guided flow:
1. Choose to clone a friend's trip or start fresh
2. Fill in basics (title, destination, cover photo, visibility)
3. Build the itinerary with drag-and-drop day/activity ordering and a curated suggestion sheet
4. Publish

**Auth** — Email/password sign-up and sign-in via Supabase Auth. A "demo" bypass is available during development.

---

## Design System

All design tokens live in `app/globals.css` as CSS custom properties:

```css
--bg:       #0B0B14   /* page background */
--bg2:      #13131F   /* card background */
--bg3:      #1A1A28   /* elevated surface */
--gold:     #C8A55A   /* primary accent */
--gold-lt:  #E8C97A   /* light gold */
--gold-dim: rgba(200,165,90,0.12)  /* gold tint background */
--text:     #F4EFE6   /* primary text */
--text2:    #9A97B0   /* secondary text */
--text3:    #5C5A72   /* muted text */
--border:   rgba(255,255,255,0.07)
```

---

## Connecting to Real Data

The app ships with mock data in `lib/mock-data.ts`. To switch to live Supabase data:

1. Run `supabase/schema.sql` in your project
2. Replace `MOCK_TRIPS` imports in pages with Supabase queries, e.g.:

```ts
// app/(main)/page.tsx
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: trips } = await supabase
  .from('feed_trips')
  .select('*, days(*, activities(*))')
  .limit(20)
```

3. Use the `likes`, `saves`, and `ratings` tables for user interactions — each has RLS policies so only the owner can write their own rows.

---

## Deployment

Deploy to [Vercel](https://vercel.com) in one click:

1. Push to GitHub
2. Import the repo in Vercel
3. Add the three env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
4. Deploy — Vercel auto-detects Next.js

---

## License

MIT
