-- Add per-plan limit for how many ticket panels a guild can post
ALTER TABLE "Plan"
ADD COLUMN IF NOT EXISTS "maxTicketPanels" INTEGER NOT NULL DEFAULT 1;
