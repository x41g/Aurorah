-- CreateTable
CREATE TABLE "AdminResetAudit" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targets" JSONB NOT NULL,
    "result" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminResetAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminResetAudit_adminId_idx" ON "AdminResetAudit"("adminId");

-- CreateIndex
CREATE INDEX "AdminResetAudit_createdAt_idx" ON "AdminResetAudit"("createdAt");
