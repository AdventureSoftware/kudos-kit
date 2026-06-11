-- db/roles.sql
-- Run as superuser inside the feedback database

create role feedback_ingest login password 'CHANGE_ME_INGEST';
grant insert on feedback to feedback_ingest;
grant select on projects to feedback_ingest;

create role feedback_admin login password 'CHANGE_ME_ADMIN';
grant select, delete on feedback to feedback_admin;
grant update (status) on feedback to feedback_admin;
grant select on projects to feedback_admin;

grant usage on schema public to feedback_ingest;
grant usage on schema public to feedback_admin;
grant usage on all sequences in schema public to feedback_ingest;
