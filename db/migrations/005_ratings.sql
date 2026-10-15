-- 005_ratings.sql
-- Optional 1–5 star rating the sender can add to praise, ideas and other feedback.
-- Never on bug reports: someone reporting a bug rates the bug, not the product.

BEGIN;

ALTER TABLE feedback ADD COLUMN IF NOT EXISTS rating smallint;

ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_rating_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_rating_check
  CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5 AND type <> 'bug'));

-- feedback_ingest inserts it through its table-wide INSERT grant; feedback_admin reads it
-- through its table-wide SELECT grant. Nobody may change a rating after it was sent.

COMMIT;
