-- The One-Page Learn HTML now lives on the content row (like the essay body),
-- instead of a separate file in storage. This lets it be updated with a normal
-- DB write (no service-role key, no file overwrite, no slug/track-prefix logic).
--
-- Safe and additive. Older days keep learn_html NULL and fall back to their
-- stored learn-<slug>.html file; new days write learn_html directly.
--
-- Run once in the Supabase SQL editor.

alter table content add column if not exists learn_html text;
