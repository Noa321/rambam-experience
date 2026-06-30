-- Track plumbing for the second study cycle (1 chapter/day) alongside the
-- existing 3 chapters/day cycle. Safe and additive: both columns default to
-- 'three-chapter', so every existing row is tagged as the current track and all
-- track-filtered reads return exactly what they did before.
--
-- Run this in the Supabase SQL editor BEFORE deploying the track-aware app code.

-- 1) Tag content rows with a track.
alter table content
  add column if not exists track text not null default 'three-chapter';

-- 2) Tag game_cases rows with a track.
alter table game_cases
  add column if not exists track text not null default 'three-chapter';

-- 3) game_cases currently allows only one row per date (rambam_date is UNIQUE).
--    The two cycles will share dates, so move uniqueness to (rambam_date, track).
alter table game_cases drop constraint if exists game_cases_rambam_date_key;
create unique index if not exists game_cases_date_track_uniq
  on game_cases (rambam_date, track);
