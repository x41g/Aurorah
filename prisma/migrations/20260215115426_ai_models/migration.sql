/*
  Warnings:

  - You are about to drop the column `apiKey` on the `GuildAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `GuildAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `GuildAIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `staffRoleId` on the `GuildAIConfig` table. All the data in the column will be lost.
  - The primary key for the `TicketAIMemory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lastSummaryAt` on the `TicketAIMemory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guildId,channelId]` on the table `TicketAIMemory` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `TicketAIMemory` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "GuildAIConfig_enabled_idx";

-- DropIndex
DROP INDEX "TicketAIMessage_channelId_idx";

-- DropIndex
DROP INDEX "TicketAIMessage_createdAt_idx";

-- AlterTable
ALTER TABLE "GuildAIConfig" DROP COLUMN "apiKey",
DROP COLUMN "model",
DROP COLUMN "prompt",
DROP COLUMN "staffRoleId",
ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "TicketAIMemory" DROP CONSTRAINT "TicketAIMemory_pkey",
DROP COLUMN "lastSummaryAt",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "summary" DROP NOT NULL,
ALTER COLUMN "summary" DROP DEFAULT,
ADD CONSTRAINT "TicketAIMemory_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "TicketAIMemory_guildId_channelId_key" ON "TicketAIMemory"("guildId", "channelId");

-- CreateIndex
CREATE INDEX "TicketAIMessage_guildId_channelId_idx" ON "TicketAIMessage"("guildId", "channelId");
