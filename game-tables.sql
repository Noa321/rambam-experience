-- The Rambam Riddle — run this once in Supabase → SQL Editor → New query → Run

create table if not exists game_puzzles (
  id uuid default gen_random_uuid() primary key,
  rambam_date date unique not null,
  chapters_label text not null,
  sefer text not null,
  hilchot text not null,
  riddle_data jsonb not null,
  created_at timestamptz default now()
);
alter table game_puzzles enable row level security;
create policy "Public read game_puzzles" on game_puzzles for select using (true);

create table if not exists game_scores (
  id uuid default gen_random_uuid() primary key,
  device_id text not null,
  rambam_date date not null,
  score integer not null,
  max_score integer default 9,
  round_results jsonb not null,
  played_at timestamptz default now(),
  unique(device_id, rambam_date)
);
alter table game_scores enable row level security;
create policy "Public insert game_scores" on game_scores for insert with check (true);
create policy "Public read game_scores" on game_scores for select using (true);
