-- Run this in the Supabase SQL Editor to add the relevance_check column.
-- This is a one-time migration. After running it, re-run curate_cases_v3.mjs
-- to persist the Gemini classification results (cached in relevance_results.json).

ALTER TABLE cases ADD COLUMN IF NOT EXISTS relevance_check text DEFAULT 'RELEVANT';

-- Optional: add an index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_cases_relevance_check ON cases (relevance_check);
CREATE INDEX IF NOT EXISTS idx_cases_curated ON cases (is_curated);

-- Verify
SELECT track, subtype, count(*) AS total,
       count(*) FILTER (WHERE relevance_check = 'IRRELEVANT') AS irrelevant,
       count(*) FILTER (WHERE is_curated = true) AS curated
FROM cases
GROUP BY track, subtype
ORDER BY track, subtype;
