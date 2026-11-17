-- 002_project_refs.sql
-- Per-project references for feedback, e.g. MS-12 = the 12th report for the project "My Shop".
--
-- Applied automatically by db/migrate.sh (safe to run again).
-- Existing feedback is numbered in the order it was received.

BEGIN;

-- 1. Columns ------------------------------------------------------------------

ALTER TABLE projects ADD COLUMN IF NOT EXISTS prefix text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS next_number integer NOT NULL DEFAULT 1;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS number integer;

-- 2. Prefixes -----------------------------------------------------------------

-- Derives a unique prefix from a project key when none is given:
-- 'my-shop' -> 'MY', then 'MY2', 'MY3' ... if taken. Letters only, max 5 characters.
CREATE OR REPLACE FUNCTION kk_unique_prefix(p_key text, p_exclude text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  base text := upper(left(regexp_replace(p_key, '[^A-Za-z]', '', 'g'), 2));
  candidate text;
  n integer := 1;
BEGIN
  IF base = '' THEN base := 'P'; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM projects WHERE prefix = candidate AND key IS DISTINCT FROM p_exclude) LOOP
    n := n + 1;
    candidate := base || n;
  END LOOP;
  RETURN candidate;
END $$;

-- Fills in a missing prefix and normalises a given one to upper case.
CREATE OR REPLACE FUNCTION kk_project_prefix() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.prefix IS NULL OR btrim(NEW.prefix) = '' THEN
    NEW.prefix := kk_unique_prefix(NEW.key, NEW.key);
  ELSE
    NEW.prefix := upper(btrim(NEW.prefix));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS projects_prefix ON projects;
CREATE TRIGGER projects_prefix BEFORE INSERT OR UPDATE OF prefix ON projects
  FOR EACH ROW EXECUTE FUNCTION kk_project_prefix();

-- Chosen prefixes for the projects of the first installation (only where none is set yet).
-- On any other database these three lines change nothing. Kept because released migrations
-- are never edited in ways that change what they do.
UPDATE projects SET prefix = 'CP' WHERE key = 'colorpage'    AND prefix IS NULL;
UPDATE projects SET prefix = 'PS' WHERE key = 'productscene' AND prefix IS NULL;
UPDATE projects SET prefix = 'BP' WHERE key = 'bizpage'      AND prefix IS NULL;
-- Any other project gets a derived one.
UPDATE projects SET prefix = NULL WHERE prefix IS NULL;  -- fires the trigger

ALTER TABLE projects ALTER COLUMN prefix SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE projects ADD CONSTRAINT projects_prefix_unique UNIQUE (prefix);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD CONSTRAINT projects_prefix_format CHECK (prefix ~ '^[A-Z][A-Z0-9]{0,4}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Number existing feedback, oldest first, per project ---------------------

WITH numbered AS (
  SELECT id, row_number() OVER (PARTITION BY project ORDER BY created_at, id) AS n
  FROM feedback
)
UPDATE feedback f SET number = numbered.n
FROM numbered
WHERE f.id = numbered.id AND f.number IS NULL;

UPDATE projects p
SET next_number = COALESCE((SELECT max(number) FROM feedback f WHERE f.project = p.key), 0) + 1;

ALTER TABLE feedback ALTER COLUMN number SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE feedback ADD CONSTRAINT feedback_project_number_unique UNIQUE (project, number);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

-- 4. Number new feedback automatically ----------------------------------------
-- SECURITY DEFINER: runs with the owner's rights, so feedback_ingest stays insert-only
-- and needs no UPDATE permission on projects. The UPDATE locks the project's row, so two
-- reports arriving at the same moment get consecutive numbers, never the same one.

CREATE OR REPLACE FUNCTION kk_assign_feedback_number() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE projects
     SET next_number = next_number + 1
   WHERE key = NEW.project
  RETURNING next_number - 1 INTO NEW.number;

  IF NEW.number IS NULL THEN
    RAISE EXCEPTION 'Unknown project: %', NEW.project USING ERRCODE = 'foreign_key_violation';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS feedback_number ON feedback;
CREATE TRIGGER feedback_number BEFORE INSERT ON feedback
  FOR EACH ROW EXECUTE FUNCTION kk_assign_feedback_number();

-- The admin role reads the new columns through its existing SELECT grants.

COMMIT;
