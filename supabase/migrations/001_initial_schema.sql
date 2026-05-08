-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Trees table
create table trees (
  id uuid primary key default uuid_generate_v4(),
  topic text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'closed')),
  scripture_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  closes_at timestamptz
);

-- Scriptures table
create table scriptures (
  id uuid primary key default uuid_generate_v4(),
  book text not null,
  chapter integer not null,
  verse_start integer not null,
  verse_end integer,
  text text not null,
  tags text[] not null default '{}',
  testament text not null check (testament in ('old', 'new'))
);

-- Nodes table
create table nodes (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  tree_id uuid not null references trees(id),
  parent_node_id uuid references nodes(id),
  scripture_id uuid not null references scriptures(id),
  session_id text not null,
  depth integer not null default 0,
  created_at timestamptz not null default now()
);

-- Reactions table
create table reactions (
  id uuid primary key default uuid_generate_v4(),
  node_id uuid not null references nodes(id),
  type text not null check (type in ('pray', 'heart', 'cross', 'dove')),
  session_id text not null,
  created_at timestamptz not null default now(),
  unique(node_id, session_id, type)
);

-- Recursive CTE function to get chain from root to a node
create or replace function get_chain(node_slug text)
returns table(
  id uuid, slug text, scripture_id uuid, parent_node_id uuid,
  depth integer, created_at timestamptz
) as $$
  with recursive chain as (
    select n.id, n.slug, n.scripture_id, n.parent_node_id, n.depth, n.created_at
    from nodes n where n.slug = node_slug
    union all
    select n.id, n.slug, n.scripture_id, n.parent_node_id, n.depth, n.created_at
    from nodes n
    inner join chain c on n.id = c.parent_node_id
  )
  select * from chain order by depth asc;
$$ language sql stable;

-- Random scripture by tags function
create or replace function random_scripture_by_tags(tag_filter text[])
returns setof scriptures as $$
  select * from scriptures
  where
    array_length(tag_filter, 1) = 0
    or tags && tag_filter
  order by random()
  limit 1;
$$ language sql stable;

-- RLS Policies
alter table trees enable row level security;
alter table scriptures enable row level security;
alter table nodes enable row level security;
alter table reactions enable row level security;

-- Public read on everything
create policy "public read trees" on trees for select using (true);
create policy "public read scriptures" on scriptures for select using (true);
create policy "public read nodes" on nodes for select using (true);
create policy "public read reactions" on reactions for select using (true);

-- Insert policies for nodes (service role only)
create policy "insert nodes" on nodes for insert with check (true);

-- Reactions: anyone can insert, but only once per session per node per type
create policy "insert reactions" on reactions for insert with check (true);

-- Index for faster queries
create index idx_nodes_tree_id on nodes(tree_id);
create index idx_nodes_slug on nodes(slug);
create index idx_nodes_parent on nodes(parent_node_id);
create index idx_reactions_node on reactions(node_id);