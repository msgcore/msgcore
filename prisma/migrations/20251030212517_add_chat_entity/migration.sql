-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('individual', 'group', 'channel');

-- AlterTable
ALTER TABLE "received_messages" ADD COLUMN     "chat_id" TEXT;

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "provider_chat_id" TEXT NOT NULL,
    "chat_type" "ChatType" NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "last_message_at" TIMESTAMP(3),
    "last_synced_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chats_project_id_idx" ON "chats"("project_id");

-- CreateIndex
CREATE INDEX "chats_platform_id_idx" ON "chats"("platform_id");

-- CreateIndex
CREATE INDEX "chats_last_message_at_idx" ON "chats"("last_message_at");

-- CreateIndex
CREATE INDEX "chats_chat_type_idx" ON "chats"("chat_type");

-- CreateIndex
CREATE UNIQUE INDEX "chats_project_id_platform_id_provider_chat_id_key" ON "chats"("project_id", "platform_id", "provider_chat_id");

-- CreateIndex
CREATE INDEX "received_messages_chat_id_idx" ON "received_messages"("chat_id");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "project_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "received_messages" ADD CONSTRAINT "received_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
