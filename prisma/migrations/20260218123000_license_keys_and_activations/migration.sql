CREATE TABLE IF NOT EXISTS "LicenseKey" (
  "id" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "codePrefix" TEXT NOT NULL,
  "codeLast4" TEXT NOT NULL,
  "planKey" TEXT NOT NULL,
  "durationDays" INTEGER NOT NULL DEFAULT 30,
  "maxActivations" INTEGER NOT NULL DEFAULT 1,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "expiresAt" TIMESTAMP(3),
  "note" TEXT,
  "createdBy" TEXT,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LicenseKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LicenseActivation" (
  "id" TEXT NOT NULL,
  "keyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "guildId" TEXT,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LicenseActivation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LicenseKey_codeHash_key" ON "LicenseKey"("codeHash");
CREATE INDEX IF NOT EXISTS "LicenseKey_planKey_idx" ON "LicenseKey"("planKey");
CREATE INDEX IF NOT EXISTS "LicenseKey_status_idx" ON "LicenseKey"("status");
CREATE INDEX IF NOT EXISTS "LicenseKey_expiresAt_idx" ON "LicenseKey"("expiresAt");

CREATE UNIQUE INDEX IF NOT EXISTS "LicenseActivation_keyId_userId_guildId_key" ON "LicenseActivation"("keyId", "userId", "guildId");
CREATE INDEX IF NOT EXISTS "LicenseActivation_userId_idx" ON "LicenseActivation"("userId");
CREATE INDEX IF NOT EXISTS "LicenseActivation_guildId_idx" ON "LicenseActivation"("guildId");
CREATE INDEX IF NOT EXISTS "LicenseActivation_expiresAt_idx" ON "LicenseActivation"("expiresAt");
CREATE INDEX IF NOT EXISTS "LicenseActivation_status_idx" ON "LicenseActivation"("status");

DO $$ BEGIN
  ALTER TABLE "LicenseKey"
  ADD CONSTRAINT "LicenseKey_planKey_fkey"
  FOREIGN KEY ("planKey") REFERENCES "Plan"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "LicenseActivation"
  ADD CONSTRAINT "LicenseActivation_keyId_fkey"
  FOREIGN KEY ("keyId") REFERENCES "LicenseKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
