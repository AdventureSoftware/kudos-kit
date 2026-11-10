-- 006_manage_projects.sql
-- Lets owners and admins add projects, rename them and turn them on or off from the
-- dashboard's Projects page, instead of running scripts/add-project.sh on the server.
--
-- feedback_admin may now:
--   * add a project (INSERT). next_number is left to its default and to the numbering trigger;
--     an empty prefix lets the kk_project_prefix trigger pick one from the key.
--   * change only the name and active (column-level UPDATE). The key and the prefix stay fixed:
--     the widget on every site sends the key, and the prefix is part of references like CP-12.
-- It still can't delete projects: their feedback depends on them. Turning one off is the way
-- to stop it; the server then refuses new feedback for it.

BEGIN;

GRANT INSERT ON projects TO feedback_admin;
GRANT UPDATE (name, active) ON projects TO feedback_admin;

COMMIT;
