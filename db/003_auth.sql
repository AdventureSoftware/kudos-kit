-- 003_auth.sql
-- Tables for Better Auth (email + password, Google, GitHub) and its organization plugin.
-- Generated from Better Auth 1.7.7's schema, renamed to this project's style (plural,
-- snake_case). The Prisma models in server/prisma/schema.prisma map onto these names.


BEGIN;

-- 1. Accounts ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id             text        PRIMARY KEY,
  name           text        NOT NULL,
  email          text        NOT NULL UNIQUE,
  email_verified boolean     NOT NULL DEFAULT false,
  image          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Active logins. The token is what the session cookie carries.
CREATE TABLE IF NOT EXISTS sessions (
  id                     text        PRIMARY KEY,
  token                  text        NOT NULL UNIQUE,
  user_id                text        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at             timestamptz NOT NULL,
  ip_address             text,
  user_agent             text,
  active_organization_id text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

-- One row per sign-in method: provider_id 'credential' holds the password hash,
-- 'google' / 'github' hold the OAuth link.
CREATE TABLE IF NOT EXISTS accounts (
  id                       text        PRIMARY KEY,
  user_id                  text        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  account_id               text        NOT NULL,
  provider_id              text        NOT NULL,
  access_token             text,
  refresh_token            text,
  id_token                 text,
  access_token_expires_at  timestamptz,
  refresh_token_expires_at timestamptz,
  scope                    text,
  password                 text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts (user_id);

-- Short-lived tokens: email verification, password reset.
CREATE TABLE IF NOT EXISTS verifications (
  id         text        PRIMARY KEY,
  identifier text        NOT NULL,
  value      text        NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verifications_identifier_idx ON verifications (identifier);

-- 2. Team (organization plugin; Kudos Kit uses exactly one organization) -------

CREATE TABLE IF NOT EXISTS organizations (
  id         text        PRIMARY KEY,
  name       text        NOT NULL,
  slug       text        NOT NULL UNIQUE,
  logo       text,
  metadata   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id              text        PRIMARY KEY,
  organization_id text        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  user_id         text        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role            text        NOT NULL DEFAULT 'member',  -- owner | admin | member
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS members_user_id_idx ON members (user_id);

CREATE TABLE IF NOT EXISTS invitations (
  id              text        PRIMARY KEY,
  organization_id text        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  email           text        NOT NULL,
  role            text,
  status          text        NOT NULL DEFAULT 'pending', -- pending | accepted | rejected | canceled
  inviter_id      text        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invitations_organization_id_idx ON invitations (organization_id);
CREATE INDEX IF NOT EXISTS invitations_email_idx ON invitations (email);

-- 3. Permissions ----------------------------------------------------------------
-- feedback_admin (NestJS admin side and Better Auth) reads and writes accounts.
-- feedback_ingest (the public widget endpoint) gets nothing: even if that endpoint were
-- abused, it could never read or change a user, session or password hash.

GRANT SELECT, INSERT, UPDATE, DELETE
  ON users, sessions, accounts, verifications, organizations, members, invitations
  TO feedback_admin;

REVOKE ALL
  ON users, sessions, accounts, verifications, organizations, members, invitations
  FROM feedback_ingest;

COMMIT;
