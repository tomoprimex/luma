-- LUMA: Fix recently_viewed ON CONFLICT by adding unique constraint
-- Run this in Supabase Dashboard → SQL Editor

-- 1) Deduplicate using ROW_NUMBER() to keep exactly one row per
--    (user_id, tmdb_id, media_type), preferring the latest viewed_at,
--    and using ctid as a deterministic tie-breaker when viewed_at is equal.
WITH ranked AS (
  SELECT
    ctid,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, tmdb_id, media_type
      ORDER BY viewed_at DESC, ctid DESC
    ) AS rn
  FROM public.recently_viewed
)
DELETE FROM public.recently_viewed r
USING ranked k
WHERE r.ctid = k.ctid
  AND k.rn > 1;

-- 2) Add the UNIQUE constraint required by onConflict.
--    Wrap in a DO block because PostgreSQL does NOT support
--    "ADD CONSTRAINT IF NOT EXISTS".
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'recently_viewed_user_movie_media_type_key'
      AND conrelid = 'public.recently_viewed'::regclass
  ) THEN
    ALTER TABLE public.recently_viewed
    ADD CONSTRAINT recently_viewed_user_movie_media_type_key
    UNIQUE (user_id, tmdb_id, media_type);
  END IF;
END $$;
