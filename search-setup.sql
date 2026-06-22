-- The Rambam Source Finder — run once in Supabase → SQL Editor → New query → Run

-- 1. Vector extension
create extension if not exists vector;

-- 2. Embeddings table (1536 dims = OpenAI text-embedding-3-small)
create table if not exists rambam_embeddings (
  id serial primary key,
  book_number integer not null, book_name text not null,
  treatise_name text not null, chapter_number integer not null,
  chapter_title text, content_text text not null, content_summary text,
  embedding vector(1536) not null, sefaria_ref text, created_at timestamptz default now()
);

-- NOTE: no ivfflat index. With ~1000 rows, an exact (sequential) KNN scan is
-- both fast (~ms) and accurate. An ivfflat index does APPROXIMATE search and,
-- at small limits, misses the true nearest neighbors — so we drop it if present.
drop index if exists rambam_embeddings_ivfflat;

alter table rambam_embeddings enable row level security;
drop policy if exists "Public read rambam_embeddings" on rambam_embeddings;
create policy "Public read rambam_embeddings" on rambam_embeddings for select using (true);

-- 3. Similarity-search function the API calls
create or replace function match_rambam_chapters(
  query_embedding vector(1536), match_threshold float default 0.3, match_count int default 5
) returns table (
  id int, book_number int, book_name text, treatise_name text, chapter_number int,
  content_text text, content_summary text, sefaria_ref text, similarity float
) language plpgsql as $$
begin
  return query
  select re.id, re.book_number, re.book_name, re.treatise_name, re.chapter_number,
         re.content_text, re.content_summary, re.sefaria_ref,
         1 - (re.embedding <=> query_embedding) as similarity
  from rambam_embeddings re
  where 1 - (re.embedding <=> query_embedding) > match_threshold
  order by re.embedding <=> query_embedding limit match_count;
end; $$;

-- 4. Optional search analytics
create table if not exists rambam_search_log (
  id uuid default gen_random_uuid() primary key, query text not null,
  results_count integer, top_match_treatise text, top_match_chapter integer,
  top_match_similarity float, searched_at timestamptz default now()
);
alter table rambam_search_log enable row level security;
drop policy if exists "Insert search logs" on rambam_search_log;
create policy "Insert search logs" on rambam_search_log for insert with check (true);
