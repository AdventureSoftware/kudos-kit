-- db/schema.sql
create database feedback;
\c feedback

create table projects (
  key    text primary key,
  name   text not null,
  active boolean not null default true
);

create table feedback (
  id           bigint generated always as identity primary key,
  project      text not null references projects(key),
  type         text not null check (type in ('bug','idea','other')),
  message      text not null,
  email        text,
  user_ctx     jsonb,
  context      jsonb,
  console_logs jsonb,
  errors       jsonb,
  status       text not null default 'new' check (status in ('new','triaged','done')),
  ip           inet,
  created_at   timestamptz not null default now()
);

create index on feedback (project, status, created_at desc);
