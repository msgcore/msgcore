-- AlterTable
ALTER TABLE "sent_messages" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'api';

-- CreateTable
CREATE TABLE "blocked_messages" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_id" TEXT,
    "policy_id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "message_text" TEXT NOT NULL,
    "violations" JSONB NOT NULL,
    "metadata" JSONB,
    "blocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardrail_policies" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "direction" TEXT NOT NULL,
    "providers" JSONB NOT NULL,
    "strategy" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardrail_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blocked_messages_blocked_at_idx" ON "blocked_messages"("blocked_at");

-- CreateIndex
CREATE INDEX "blocked_messages_direction_idx" ON "blocked_messages"("direction");

-- CreateIndex
CREATE INDEX "blocked_messages_policy_id_idx" ON "blocked_messages"("policy_id");

-- CreateIndex
CREATE INDEX "blocked_messages_project_id_idx" ON "blocked_messages"("project_id");

-- CreateIndex
CREATE INDEX "guardrail_policies_project_id_idx" ON "guardrail_policies"("project_id");

-- CreateIndex
CREATE INDEX "guardrail_policies_project_id_is_active_idx" ON "guardrail_policies"("project_id", "is_active");

-- CreateIndex
CREATE INDEX "sent_messages_source_idx" ON "sent_messages"("source");

-- AddForeignKey
ALTER TABLE "blocked_messages" ADD CONSTRAINT "blocked_messages_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "guardrail_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_messages" ADD CONSTRAINT "blocked_messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardrail_policies" ADD CONSTRAINT "guardrail_policies_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
