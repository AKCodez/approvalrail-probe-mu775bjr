-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('X', 'INSTAGRAM', 'LINKEDIN', 'THREADS', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "ApprovalState" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'SENT_FOR_REVIEW', 'APPROVED', 'REJECTED', 'RELEASED', 'EDITED');

-- DropForeignKey
ALTER TABLE "snippet" DROP CONSTRAINT "snippet_userId_fkey";

-- DropTable
DROP TABLE "snippet";

-- DropEnum
DROP TYPE "SnippetStatus";

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_item" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "body" TEXT NOT NULL,
    "sourceAssetTitle" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "state" "ApprovalState" NOT NULL DEFAULT 'DRAFT',
    "reviewToken" TEXT NOT NULL,
    "reviewerName" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actor" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_meter" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "generations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_meter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_ownerId_idx" ON "workspace"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "approval_item_reviewToken_key" ON "approval_item"("reviewToken");

-- CreateIndex
CREATE INDEX "approval_item_workspaceId_state_idx" ON "approval_item"("workspaceId", "state");

-- CreateIndex
CREATE INDEX "approval_item_workspaceId_clientName_idx" ON "approval_item"("workspaceId", "clientName");

-- CreateIndex
CREATE INDEX "audit_event_itemId_createdAt_idx" ON "audit_event"("itemId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "usage_meter_workspaceId_period_key" ON "usage_meter"("workspaceId", "period");

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_item" ADD CONSTRAINT "approval_item_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "approval_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_meter" ADD CONSTRAINT "usage_meter_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
