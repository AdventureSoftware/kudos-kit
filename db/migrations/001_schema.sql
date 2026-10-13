-- 001_schema.sql
-- Projects and feedback, and what the two database roles may do with them.
-- The roles themselves (with their passwords) are created by db/migrate.sh before this runs.
-- Safe to run on a database that already has these tables.

BEGIN;

CREATE TABLE IF NOT EXISTS projects (
  key    text    PRIMARY KEY,
  name   text    NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS feedback (
  id           bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project      text        NOT NULL REFERENCES projects (key),
  type         text        NOT NULL CHECK (type IN ('bug', 'idea', 'other')),
  message      text        NOT NULL,
  email        text,
  user_ctx     jsonb,
  context      jsonb,
  console_logs jsonb,
  errors       jsonb,
  status       text        NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'done')),
  ip           inet,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_project_status_created_at_idx ON feedback (project, status, created_at DESC);

-- feedback_ingest: the public widget endpoint. Can only add feedback and read project keys.
GRANT USAGE ON SCHEMA public TO feedback_ingest;
GRANT SELECT ON projects TO feedback_ingest;
GRANT INSERT ON feedback TO feedback_ingest;
GRANT SELECT (id) ON feedback TO feedback_ingest;           -- for INSERT ... RETURNING id
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO feedback_ingest;

-- feedback_admin: the dashboard. Reads feedback, changes its status, deletes it.
GRANT USAGE ON SCHEMA public TO feedback_admin;
GRANT SELECT ON projects TO feedback_admin;
GRANT SELECT, DELETE ON feedback TO feedback_admin;
GRANT UPDATE (status) ON feedback TO feedback_admin;

COMMIT;
