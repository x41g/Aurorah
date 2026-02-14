/*
  Warnings:

  - Added the required column `guildId` to the `Transcript` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transcript" ADD COLUMN     "guildId" TEXT NOT NULL,
ALTER COLUMN "guildSlug" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Transcript_guildId_idx" ON "Transcript"("guildId");
