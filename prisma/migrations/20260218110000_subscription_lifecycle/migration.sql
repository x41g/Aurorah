ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "statusReason" TEXT,
  ADD COLUMN IF NOT EXISTS "lastStatusChangeAt" TIMESTAMP(3);

UPDATE "Subscription"
SET "status" = lower("status")
WHERE "status" <> lower("status");

UPDATE "Subscription"
SET "startedAt" = "createdAt"
WHERE "startedAt" IS NULL
  AND lower("status") IN ('scheduled', 'trialing', 'active', 'past_due', 'canceled', 'expired');

UPDATE "Subscription"
SET "lastStatusChangeAt" = "updatedAt"
WHERE "lastStatusChangeAt" IS NULL;

CREATE INDEX IF NOT EXISTS "Subscription_expiresAt_idx" ON "Subscription"("expiresAt");
CREATE INDEX IF NOT EXISTS "Subscription_startedAt_idx" ON "Subscription"("startedAt");
