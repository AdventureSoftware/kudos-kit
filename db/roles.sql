-- db/roles.sql
-- Run as superuser inside the feedback database

create role feedback_ingest login password '1q2w3e4r5t';
grant insert on feedback to feedback_ingest;
grant select on projects to feedback_ingest;

create role feedback_admin login password '1q2w3e4r5t';
grant select, delete on feedback to feedback_admin;
grant update (status) on feedback to feedback_admin;
grant select on projects to feedback_admin;

grant usage on schema public to feedback_ingest;
grant usage on schema public to feedback_admin;
grant usage on all sequences in schema public to feedback_ingest;
grant select (id) on feedback to feedback_ingest;
