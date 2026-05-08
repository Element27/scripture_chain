-- Create new scripture_topics table
create table scripture_topics (
  id uuid primary key default uuid_generate_v4(),
  topic text not null,
  citation text not null,
  text text,
  created_at timestamptz not null default now(),
  unique(topic, citation)
);

-- RLS
alter table scripture_topics enable row level security;
create policy "public read scripture_topics" on scripture_topics for select using (true);
create policy "insert scripture_topics" on scripture_topics for insert with check (true);

-- Index for faster lookups
create index idx_scripture_topics_topic on scripture_topics(topic);