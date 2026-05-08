# Scripture Chain - MVP Specification

## App Name
"Scripture Chain" (placeholder, configurable)

## Tech Stack
- Next.js 14+ with App Router and TypeScript
- Tailwind CSS for styling
- Supabase for database, anonymous auth, Edge Functions
- react-qr-code for QR code generation
- Vercel for deployment

## Pages

### 1. Home Page (/)
- Warm, faith-filled hero section at top
- Active trees as cards (topic, description, node count, closes_at)
- Past trees in separate "Past Trees" section
- "Join a Tree" CTA scrolls to active trees

### 2. Node Page (/node/[slug])
- State A: Fresh visitor - shows receiving scripture, reaction counts, CTAs
- State B: After generating - shows new scripture, QR code, share link
- State C: Viewing own node - same as State B (detected via session_id)

### 3. Chain Page (/chain/[slug])
- Linear ancestry from root to current node
- Each step: scripture text, reference, depth number
- Current node highlighted
- Visual connector (gold line) between cards

### 4. Admin Page (/admin)
- Password protected
- Form to create trees
- List of trees with ability to close them
- Node counts per tree

## Database Schema

### Tables
- trees: id, topic, description, status, scripture_tags, created_at, closes_at
- scriptures: id, book, chapter, verse_start, verse_end, text, tags, testament
- nodes: id, slug, tree_id, parent_node_id, scripture_id, session_id, depth, created_at
- reactions: id, node_id, type, session_id, created_at

### RLS Policies
- Public read on all tables
- Reactions: insert only (any session can react)

## Edge Functions
- generate-scripture: Validates tree is open, checks session, picks random scripture, creates node

## Design Direction
- Aesthetic: Sacred warmth - illuminated manuscript meets modern mobile app
- Colors: Deep warm browns, gold accents, cream text
- Typography: Lora for scripture, DM Sans for UI
- Motion: Gentle fade-ups, bloom on reveal, bounce on reaction

## Acceptance Criteria
- Home shows active/past trees
- Visiting node link shows sharer's scripture
- Generating creates linked node scoped to tree theme
- Session can only generate once per tree
- QR code and copy link work
- Chain view shows ancestry
- Reactions work anonymously
- Admin can create/close trees
- OG image renders for link previews
- Mobile responsive