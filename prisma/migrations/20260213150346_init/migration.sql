-- CreateTable
CREATE TABLE "GuildConfig" (
    "guildId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildConfig_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "GuildStats" (
    "guildId" TEXT NOT NULL,
    "todayKey" TEXT,
    "ticketsCreatedToday" INTEGER NOT NULL DEFAULT 0,
    "ticketsClosedToday" INTEGER NOT NULL DEFAULT 0,
    "staff" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildStats_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "BotState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "guildIds" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Whitelist" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "guildIds" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "guildSlug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shortcode" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "passHash" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_slug_key" ON "Transcript"("slug");

-- CreateIndex
CREATE INDEX "Transcript_guildSlug_idx" ON "Transcript"("guildSlug");

-- CreateIndex
CREATE INDEX "Transcript_userId_idx" ON "Transcript"("userId");

-- CreateIndex
CREATE INDEX "Transcript_expireAt_idx" ON "Transcript"("expireAt");
