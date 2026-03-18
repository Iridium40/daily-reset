-- ============================================================================
-- My Metabolic Reboot — Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================================

-- Enum for user roles
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN');

-- ─── ORGANIZATIONS ──────────────────────────────────────────────────────────
CREATE TABLE "organizations" (
  "id"              TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "slug"            TEXT NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "name"            TEXT NOT NULL,
  "primaryColor"    TEXT NOT NULL DEFAULT '#3E4A27',
  "accentColor"     TEXT NOT NULL DEFAULT '#C45A1A',
  "welcomeMessage"  TEXT,
  "facebookUrl"         TEXT,

  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- ─── USERS ──────────────────────────────────────────────────────────────────
-- id = Supabase auth.users UUID (no local password storage)
CREATE TABLE "users" (
  "id"              TEXT NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "email"           TEXT NOT NULL,
  "name"            TEXT,
  "role"            "Role" NOT NULL DEFAULT 'ORG_ADMIN',
  "orgId"           TEXT,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
ALTER TABLE "users"
  ADD CONSTRAINT "users_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CHECKLIST PROGRESS ─────────────────────────────────────────────────────
-- Anonymous clients identified by UUID in localStorage
CREATE TABLE "checklist_progress" (
  "id"              TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "clientToken"     TEXT NOT NULL,
  "orgId"           TEXT NOT NULL,
  "listKey"         TEXT NOT NULL,
  "checkedJson"     TEXT NOT NULL,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "checklist_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "checklist_progress_clientToken_orgId_listKey_key"
  ON "checklist_progress"("clientToken", "orgId", "listKey");

ALTER TABLE "checklist_progress"
  ADD CONSTRAINT "checklist_progress_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── ZOOM CALLS ───────────────────────────────────────────────────────────
CREATE TABLE "zoom_calls" (
  "id"              TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "orgId"           TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "zoomLink"        TEXT NOT NULL,
  "schedule"        TEXT,
  "meetingId"       TEXT,
  "recordingsUrl"   TEXT,
  "sortOrder"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "zoom_calls_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "zoom_calls"
  ADD CONSTRAINT "zoom_calls_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── COACH INVITES ──────────────────────────────────────────────────────────
CREATE TABLE "coach_invites" (
  "id"              TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "orgId"           TEXT NOT NULL,
  "email"           TEXT NOT NULL,
  "token"           TEXT NOT NULL,
  "expiresAt"       TIMESTAMP(3) NOT NULL,
  "acceptedAt"      TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "coach_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "coach_invites_token_key" ON "coach_invites"("token");

ALTER TABLE "coach_invites"
  ADD CONSTRAINT "coach_invites_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── PRISMA MIGRATIONS TRACKING ─────────────────────────────────────────────
-- This table lets Prisma know the DB is already set up
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                    VARCHAR(36) NOT NULL,
  "checksum"              VARCHAR(64) NOT NULL,
  "finished_at"           TIMESTAMPTZ,
  "migration_name"        VARCHAR(255) NOT NULL,
  "logs"                  TEXT,
  "rolled_back_at"        TIMESTAMPTZ,
  "started_at"            TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count"   INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
