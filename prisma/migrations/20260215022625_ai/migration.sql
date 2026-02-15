-- CreateTable
CREATE TABLE "GuildAIConfig" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "model" TEXT,
    "prompt" TEXT,
    "staffRoleId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildAIConfig_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "TicketAIMessage" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketAIMemory" (
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "lastSummaryAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAIMemory_pkey" PRIMARY KEY ("channelId")
);

-- CreateIndex
CREATE INDEX "GuildAIConfig_enabled_idx" ON "GuildAIConfig"("enabled");

-- CreateIndex
CREATE INDEX "TicketAIMessage_guildId_idx" ON "TicketAIMessage"("guildId");

-- CreateIndex
CREATE INDEX "TicketAIMessage_channelId_idx" ON "TicketAIMessage"("channelId");

-- CreateIndex
CREATE INDEX "TicketAIMessage_createdAt_idx" ON "TicketAIMessage"("createdAt");

-- CreateIndex
CREATE INDEX "TicketAIMemory_guildId_idx" ON "TicketAIMemory"("guildId");
