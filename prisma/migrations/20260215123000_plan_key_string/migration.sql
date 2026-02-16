-- Convert Plan key and Subscription.planKey from enum to text (dynamic plans)
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_planKey_fkey";

ALTER TABLE "Plan"
  ALTER COLUMN "key" TYPE TEXT USING "key"::text;

ALTER TABLE "Subscription"
  ALTER COLUMN "planKey" TYPE TEXT USING "planKey"::text;

DROP TYPE IF EXISTS "PlanKey";

ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_planKey_fkey"
  FOREIGN KEY ("planKey") REFERENCES "Plan"("key")
  ON DELETE RESTRICT ON UPDATE CASCADE;
