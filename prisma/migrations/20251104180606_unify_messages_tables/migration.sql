/*
  Unify sent_messages and received_messages into a single messages table

  This migration:
  1. Creates new enums
  2. Creates new messages table
  3. Migrates data from both old tables
  4. Updates relations
  5. Drops old tables
*/

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('sent', 'received');

-- CreateEnum
CREATE TYPE "MessageSource" AS ENUM ('api', 'phone', 'webhook');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('queued', 'sent', 'delivered', 'failed');

-- CreateTable (new unified messages table)
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "source" "MessageSource" NOT NULL,
    "provider_message_id" TEXT,
    "provider_chat_id" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "user_display" TEXT,
    "message_text" TEXT,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "message_content" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "job_id" TEXT,
    "status" "MessageStatus",
    "error_message" TEXT,
    "raw_data" JSONB,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "messages_job_id_key" ON "messages"("job_id");
CREATE INDEX "messages_chat_id_timestamp_idx" ON "messages"("chat_id", "timestamp" DESC);
CREATE INDEX "messages_project_id_timestamp_idx" ON "messages"("project_id", "timestamp");
CREATE INDEX "messages_platform_id_timestamp_idx" ON "messages"("platform_id", "timestamp");
CREATE INDEX "messages_provider_chat_id_idx" ON "messages"("provider_chat_id");
CREATE INDEX "messages_provider_user_id_idx" ON "messages"("provider_user_id");
CREATE INDEX "messages_direction_idx" ON "messages"("direction");
CREATE INDEX "messages_source_idx" ON "messages"("source");
CREATE INDEX "messages_status_idx" ON "messages"("status");
CREATE INDEX "messages_job_id_idx" ON "messages"("job_id");
CREATE UNIQUE INDEX "messages_platform_id_provider_message_id_key" ON "messages"("platform_id", "provider_message_id");

-- Add foreign keys to new table
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "project_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate data from received_messages
-- For received messages that have a chat_id
INSERT INTO "messages" (
    "id",
    "project_id",
    "platform_id",
    "chat_id",
    "direction",
    "source",
    "provider_message_id",
    "provider_chat_id",
    "provider_user_id",
    "user_display",
    "message_text",
    "message_type",
    "message_content",
    "timestamp",
    "job_id",
    "status",
    "error_message",
    "raw_data"
)
SELECT
    rm.id,
    rm.project_id,
    rm.platform_id,
    rm.chat_id,
    'received'::"MessageDirection",
    CASE
        WHEN rm.from_me THEN 'phone'::"MessageSource"
        ELSE 'webhook'::"MessageSource"
    END,
    rm.provider_message_id,
    rm.provider_chat_id,
    rm.provider_user_id,
    rm.user_display,
    rm.message_text,
    rm.message_type,
    NULL,  -- message_content (didn't exist in received_messages)
    rm.received_at,
    NULL,  -- job_id (didn't exist in received_messages)
    NULL,  -- status (only for sent messages)
    NULL,  -- error_message (only for sent messages)
    rm.raw_data
FROM received_messages rm
WHERE rm.chat_id IS NOT NULL;

-- Migrate data from sent_messages
-- First, we need to find the chat_id by looking up the chat by provider_chat_id
INSERT INTO "messages" (
    "id",
    "project_id",
    "platform_id",
    "chat_id",
    "direction",
    "source",
    "provider_message_id",
    "provider_chat_id",
    "provider_user_id",
    "user_display",
    "message_text",
    "message_type",
    "message_content",
    "timestamp",
    "job_id",
    "status",
    "error_message",
    "raw_data"
)
SELECT
    sm.id,
    sm.project_id,
    sm.platform_id,
    c.id as chat_id,  -- Lookup chat by providerChatId
    'sent'::"MessageDirection",
    sm.source::"MessageSource",  -- 'api' or 'phone'
    sm.provider_message_id,
    sm.target_chat_id as provider_chat_id,
    COALESCE(sm.target_user_id, sm.target_chat_id) as provider_user_id,
    NULL as user_display,  -- sent messages don't have user_display
    sm.message_text,
    'text' as message_type,  -- sent messages don't have message_type
    sm.message_content,
    COALESCE(sm.sent_at, sm.created_at) as timestamp,
    sm.job_id,
    sm.status::"MessageStatus",
    sm.error_message,
    NULL as raw_data  -- sent messages don't store raw_data
FROM sent_messages sm
INNER JOIN chats c ON c.project_id = sm.project_id
    AND c.platform_id = sm.platform_id
    AND c.provider_chat_id = sm.target_chat_id;

-- Update received_reactions to add message_id and timestamp
ALTER TABLE "received_reactions" ADD COLUMN "message_id" TEXT;
ALTER TABLE "received_reactions" ADD COLUMN "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Link reactions to messages via provider_message_id
UPDATE received_reactions rr
SET message_id = m.id,
    timestamp = rr.received_at
FROM messages m
WHERE rr.platform_id = m.platform_id
  AND rr.provider_message_id = m.provider_message_id;

-- Drop old columns from received_reactions
ALTER TABLE "received_reactions" DROP COLUMN "platform";
ALTER TABLE "received_reactions" DROP COLUMN "received_at";

-- Drop old indexes
DROP INDEX IF EXISTS "received_reactions_project_id_provider_message_id_provider__idx";
DROP INDEX IF EXISTS "received_reactions_received_at_idx";

-- Create new indexes for received_reactions
CREATE INDEX "received_reactions_message_id_idx" ON "received_reactions"("message_id");
CREATE INDEX "received_reactions_timestamp_idx" ON "received_reactions"("timestamp");

-- Add FK from received_reactions to messages
ALTER TABLE "received_reactions" ADD CONSTRAINT "received_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop FK from message_attachments to old table
ALTER TABLE "message_attachments" DROP CONSTRAINT IF EXISTS "message_attachments_message_id_fkey";

-- Add FK from message_attachments to new messages table
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old tables
DROP TABLE IF EXISTS "received_messages" CASCADE;
DROP TABLE IF EXISTS "sent_messages" CASCADE;
