-- CreateTable
CREATE TABLE "GuildAiConfig" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "persona" TEXT NOT NULL DEFAULT '',
    "rules" TEXT NOT NULL DEFAULT '',
    "knowledgeText" TEXT NOT NULL DEFAULT '',
    "escalationMode" TEXT NOT NULL DEFAULT 'staffRole',
    "escalationRoleId" TEXT,
    "escalationChannelId" TEXT,
    "memoryMaxMessages" INTEGER NOT NULL DEFAULT 20,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildAiConfig_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "TicketAiMessage" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketAiMessage_guildId_channelId_createdAt_idx" ON "TicketAiMessage"("guildId", "channelId", "createdAt");
