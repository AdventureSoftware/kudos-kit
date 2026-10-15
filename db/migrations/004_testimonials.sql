-- 004_testimonials.sql
-- A new feedback type, "praise", and the sender's consent to use it as a testimonial.
--
-- testimonial_ok    the sender ticked "You may show my message publicly". Praise only.
-- testimonial_name  the name they want shown next to it (empty = shown as Anonymous).
-- testimonial_at    when consent was given (the record GDPR asks for).
--
-- Feedback with consent is kept after the retention period, but its technical details
-- (IP, page context, console logs, errors) are still removed then (see RetentionService).

BEGIN;

ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_type_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_type_check
  CHECK (type IN ('bug', 'idea', 'praise', 'other'));

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS testimonial_ok   boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS testimonial_name text,
  ADD COLUMN IF NOT EXISTS testimonial_at   timestamptz;

ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_testimonial_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_testimonial_check
  CHECK (
    (testimonial_ok AND type = 'praise' AND testimonial_at IS NOT NULL)
    OR (NOT testimonial_ok AND testimonial_name IS NULL)
  );

CREATE INDEX IF NOT EXISTS feedback_testimonials_idx
  ON feedback (project, created_at DESC) WHERE testimonial_ok;

-- The dashboard role may now:
--   * clear technical details on kept testimonials (retention clean-up),
--   * withdraw consent when someone asks (sets testimonial_ok false, clears the name).
-- feedback_ingest needs nothing new: it already has INSERT on the whole table.
GRANT UPDATE (ip, context, console_logs, errors, testimonial_ok, testimonial_name, testimonial_at)
  ON feedback TO feedback_admin;

COMMIT;
