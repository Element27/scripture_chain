# AGENT.md — Scripture Chain

## Project Overview
Scripture Chain is a faith-based scripture sharing web app. A user receives a randomly 
generated Bible scripture, gets a unique QR code and link, and shares it forward. 
Everyone who receives the share gets their own random scripture, linked to the previous 
one — forming a living chain from origin to recipient.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **QR Code**: react-qr-code
- **Bible Data**: World English Bible (WEB) — open licensed JSON dataset
- **Hosting**: Vercel (frontend), Supabase Cloud (backend)

## Project Structure
/app
/layout.tsx                  # Root layout with fonts and global styles
/page.tsx                    # Home — active trees listing
/node/[slug]/page.tsx        # Node page — view scripture, generate, share
/chain/[slug]/page.tsx       # Linear chain view — origin to current node
/admin/page.tsx              # Admin — create/manage trees
/components
/ScriptureCard.tsx           # Displays a single scripture beautifully
/ChainView.tsx               # Linear ancestry chain from root to current node
/QRShare.tsx                 # QR code + copy link UI
/ReactionBar.tsx             # Emoji reactions on a node
/TreeCard.tsx                # Card for an active/closed tree on homepage
/lib
/supabase.ts                 # Supabase client (browser + server)
/bible.ts                    # Bible data loader and random scripture logic
/slugify.ts                  # Unique slug generation for nodes
/supabase
/functions/generate-scripture # Edge function for server-side random generation
/migrations/                 # SQL migration files

## Design System
- **Aesthetic**: Sacred, warm, living — not church-bulletin stiff
- **Primary font**: A serif with character for scripture display (e.g. Lora, Playfair Display)
- **UI font**: A clean, readable sans-serif (e.g. DM Sans, Outfit)
- **Colors**: Deep warm background (deep burgundy, midnight navy, or rich forest green) 
  with gold/amber accents. Not white/grey — this should feel like an illuminated manuscript 
  meets a modern app
- **Scripture cards**: Large, generous typography. The verse is the hero
- **Motion**: Subtle fade-ins, gentle reveals. Nothing jarring
- **Icons**: Minimal — use sparingly. A small cross, a leaf, a vine motif
- See DESIGN.md for full design tokens

## Admin Rules
- Admin route is /admin — protect with a simple env-based password for MVP
- Admin can: create a tree, set topic/tags/close date, manually close a tree
- No public signup for admin in MVP

## What is NOT in MVP
- User registration or profiles
- Full tree/graph visualization
- Bible studies or group features
- Comments or text discussions
- Denomination-specific pools
- Push notifications
- Multiple Bible translations
- Mobile app (PWA is acceptable)

## Code Standards
- TypeScript strict mode on
- All Supabase queries typed with generated types (supabase gen types)
- No any types
- Server Components for all data fetching pages
- Client Components only where interactivity is needed (reactions, QR, generate button)
- All scripture generation goes through Edge Functions — never raw client queries
- RLS enabled on all tables

## Database Schema

### tables

**trees**
- id: uuid (PK)
- topic: text (e.g. "faith", "prayer", "advent-2026")
- description: text
- status: enum — "open" | "closed"
- created_at: timestamptz
- closes_at: timestamptz (nullable — admin sets closing time)
- scripture_tags: text[] (tags to filter scripture pool)

**scriptures**
- id: uuid (PK)
- book: text
- chapter: integer
- verse_start: integer
- verse_end: integer (nullable — for multi-verse)
- text: text
- tags: text[] (faith, prayer, hope, healing, advent, easter, etc.)
- testament: enum — "old" | "new"

**nodes**
- id: uuid (PK)
- slug: text (unique — used in URL and QR code)
- tree_id: uuid (FK → trees)
- parent_node_id: uuid (FK → nodes, nullable — null means root node)
- scripture_id: uuid (FK → scriptures)
- session_id: text (anonymous session identifier)
- depth: integer (0 = root, increments per generation)
- created_at: timestamptz

**reactions**
- id: uuid (PK)
- node_id: uuid (FK → nodes)
- type: text (🙏 | ❤️ | ✝️ | 🕊️)
- session_id: text
- created_at: timestamptz

### Key Relationships
- A node has one parent (or none if root)
- Walking up parent_node_id from any node traces the full chain back to root
- Trees filter the scripture pool via tag matching

## Core Business Logic

### Scripture Generation
- Scripture is generated SERVER SIDE only via Supabase Edge Function
- The edge function receives: tree_id, parent_node_id, session_id
- It queries scriptures WHERE tags overlap with trees.scripture_tags
- Returns a random result using ORDER BY RANDOM() LIMIT 1
- Creates a new node record and returns the node slug
- A session can only generate ONE scripture per tree (prevent spam)

### Chain View
- Given a node slug, recursively walk parent_node_id until parent is null
- Use a recursive Postgres CTE (WITH RECURSIVE) for this
- Return ordered array from root → current node
- This is the "linear ancestry" view shown to users

### Anonymous Sessions
- On first visit, generate a UUID stored in localStorage as session_id
- Pass session_id on all generation and reaction requests
- This is the identity layer for MVP — no auth required
- Supabase RLS uses session_id to scope writes

### Sharing
- Each node has a unique slug: yourapp.com/node/[slug]
- QR code encodes this URL
- OG meta tags on /node/[slug] show the scripture for rich link previews

## Environment Variables