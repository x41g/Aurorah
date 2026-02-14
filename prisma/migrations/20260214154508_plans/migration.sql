-- CreateEnum
CREATE TYPE "PlanKey" AS ENUM ('STARTER', 'PRO');

-- CreateTable
CREATE TABLE "Plan" (
    "key" "PlanKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "maxGuilds" INTEGER NOT NULL DEFAULT 1,
    "maxTicketsPerMonth" INTEGER,
    "dashboardEnabled" BOOLEAN NOT NULL DEFAULT true,
    "paymentsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "safePayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "prioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planKey" "PlanKey" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "renewAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildOwner" (
    "guildId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildOwner_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "UsageMonthly" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "tickets" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageMonthly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "GuildOwner_ownerId_idx" ON "GuildOwner"("ownerId");

-- CreateIndex
CREATE INDEX "UsageMonthly_userId_idx" ON "UsageMonthly"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UsageMonthly_userId_monthKey_key" ON "UsageMonthly"("userId", "monthKey");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planKey_fkey" FOREIGN KEY ("planKey") REFERENCES "Plan"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
