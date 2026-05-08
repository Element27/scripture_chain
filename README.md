# Scripture Chain

A faith-based Bible scripture sharing web app built with Next.js, Supabase, and Tailwind CSS.

## What It Does

- Users see active "scripture trees" (themed collections like Faith, Prayer, Advent)
- They join a tree by scanning a QR code or clicking a shared link
- Each user generates a random scripture from the tree's theme that links to the previous one
- A linear chain forms from the root scripture to any given node
- Anyone can view the chain from origin to any node

## Tech Stack

- Next.js 14+ with App Router and TypeScript
- Tailwind CSS for styling
- Supabase for database, Edge Functions, and anonymous auth
- react-qr-code for QR code generation

## Getting Started

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_PASSWORD=your_admin_password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL migrations in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor
3. Deploy the Edge Function:
   - Navigate to the Supabase dashboard
   - Go to Edge Functions
   - Create a new function named `generate-scripture`
   - Paste the code from `supabase/functions/generate-scripture/index.ts`

### 3. Seed Scripture Data

Run the seed script to populate the database with tagged scripture verses:

```bash
npm run seed
```

### 4. Run the App

```bash
npm run dev
```

Visit http://localhost:3000 to see the app.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page with active/past trees
│   ├── layout.tsx            # Root layout with fonts
│   ├── admin/page.tsx        # Admin panel for creating trees
│   ├── node/[slug]/          # Node page (view/generate scripture)
│   │   ├── page.tsx
│   │   └── opengraph-image.tsx
│   └── chain/[slug]/         # Chain page (view ancestry)
├── components/               # UI components
│   ├── ScriptureCard.tsx
│   ├── ChainView.tsx
│   ├── QRShare.tsx
│   ├── ReactionBar.tsx
│   └── TreeCard.tsx
└── lib/                      # Utilities and config
    ├── supabase.ts
    ├── types.ts
    ├── config.ts
    └── utils.ts
supabase/
├── migrations/               # Database schema
├── functions/                # Edge Functions
└── seed-scriptures.ts       # Seed script
```

## Design

- Aesthetic: Sacred warmth - illuminated manuscript meets modern mobile app
- Colors: Deep warm browns (#1a0f0a, #261610), gold accents (#c9933a), cream text (#f5e6c8)
- Typography: Lora (serif) for scripture, DM Sans for UI
- Motion: Gentle fade-ups, bloom on reveal, bounce on reactions

## Features

### Home Page
- Warm hero section with app name and tagline
- Active trees displayed as cards with topic, description, node count, closing time
- Past trees in a separate section

### Node Page
- State A: Fresh visitor sees the shared scripture, can generate their own
- State B: After generating, shows new scripture + QR code + share link
- State C: Viewing own node (detected via session_id)

### Chain Page
- Linear ancestry from root to current node
- Each card shows scripture text, reference, depth
- Current node highlighted with "You are here"

### Admin Page
- Password protected
- Create new trees with topic, description, tags, closing date
- View all trees with node counts
- Close trees manually

## License

MIT