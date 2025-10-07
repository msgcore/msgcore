-- CreateEnum
CREATE TYPE "ProjectEnvironment" AS ENUM ('production', 'staging', 'development', 'custom');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('owner', 'admin', 'member', 'viewer');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('added', 'removed');

-- CreateEnum
CREATE TYPE "IdentityLinkMethod" AS ENUM ('manual', 'automatic');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "auth0_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "environment" "ProjectEnvironment" NOT NULL DEFAULT 'development',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "key_suffix" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_scopes" (
    "api_key_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,

    CONSTRAINT "api_key_scopes_pkey" PRIMARY KEY ("api_key_id","scope")
);

-- CreateTable
CREATE TABLE "project_platforms" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "credentials_encrypted" TEXT NOT NULL,
    "webhook_token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "test_mode" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_usage" (
    "id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response_time_ms" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT NOT NULL,

    CONSTRAINT "api_key_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "received_messages" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "provider_message_id" TEXT NOT NULL,
    "provider_chat_id" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "user_display" TEXT,
    "message_text" TEXT,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "raw_data" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "received_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sent_messages" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "job_id" TEXT,
    "provider_message_id" TEXT,
    "target_chat_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "target_type" TEXT NOT NULL,
    "message_text" TEXT,
    "message_content" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sent_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "received_reactions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "provider_message_id" TEXT NOT NULL,
    "provider_chat_id" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "user_display" TEXT,
    "emoji" VARCHAR(255) NOT NULL,
    "reaction_type" "ReactionType" NOT NULL,
    "raw_data" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "received_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_logs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_id" TEXT,
    "platform" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "webhook_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response_code" INTEGER,
    "response_body" TEXT,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identities" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "display_name" TEXT,
    "email" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_aliases" (
    "id" TEXT NOT NULL,
    "identity_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "provider_user_display" TEXT,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link_method" "IdentityLinkMethod" NOT NULL DEFAULT 'manual',

    CONSTRAINT "identity_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth0_id_key" ON "users"("auth0_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "projects_owner_id_idx" ON "projects"("owner_id");

-- CreateIndex
CREATE INDEX "project_members_user_id_idx" ON "project_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_email_idx" ON "invites"("email");

-- CreateIndex
CREATE INDEX "invites_token_idx" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_expires_at_idx" ON "invites"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_project_id_idx" ON "api_keys"("project_id");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_created_by_idx" ON "api_keys"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "project_platforms_webhook_token_key" ON "project_platforms"("webhook_token");

-- CreateIndex
CREATE INDEX "project_platforms_project_id_idx" ON "project_platforms"("project_id");

-- CreateIndex
CREATE INDEX "project_platforms_webhook_token_idx" ON "project_platforms"("webhook_token");

-- CreateIndex
CREATE INDEX "project_platforms_project_id_platform_idx" ON "project_platforms"("project_id", "platform");

-- CreateIndex
CREATE INDEX "project_platforms_project_id_name_idx" ON "project_platforms"("project_id", "name");

-- CreateIndex
CREATE INDEX "api_key_usage_api_key_id_idx" ON "api_key_usage"("api_key_id");

-- CreateIndex
CREATE INDEX "api_key_usage_timestamp_idx" ON "api_key_usage"("timestamp");

-- CreateIndex
CREATE INDEX "received_messages_project_id_idx" ON "received_messages"("project_id");

-- CreateIndex
CREATE INDEX "received_messages_platform_id_idx" ON "received_messages"("platform_id");

-- CreateIndex
CREATE INDEX "received_messages_received_at_idx" ON "received_messages"("received_at");

-- CreateIndex
CREATE INDEX "received_messages_provider_chat_id_idx" ON "received_messages"("provider_chat_id");

-- CreateIndex
CREATE INDEX "received_messages_provider_user_id_idx" ON "received_messages"("provider_user_id");

-- CreateIndex
CREATE INDEX "received_messages_platform_id_provider_user_id_idx" ON "received_messages"("platform_id", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "received_messages_platform_id_provider_message_id_key" ON "received_messages"("platform_id", "provider_message_id");

-- CreateIndex
CREATE INDEX "sent_messages_project_id_idx" ON "sent_messages"("project_id");

-- CreateIndex
CREATE INDEX "sent_messages_platform_id_idx" ON "sent_messages"("platform_id");

-- CreateIndex
CREATE INDEX "sent_messages_status_idx" ON "sent_messages"("status");

-- CreateIndex
CREATE INDEX "sent_messages_created_at_idx" ON "sent_messages"("created_at");

-- CreateIndex
CREATE INDEX "sent_messages_target_chat_id_idx" ON "sent_messages"("target_chat_id");

-- CreateIndex
CREATE INDEX "sent_messages_target_user_id_idx" ON "sent_messages"("target_user_id");

-- CreateIndex
CREATE INDEX "sent_messages_job_id_idx" ON "sent_messages"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "sent_messages_job_id_platform_id_target_chat_id_key" ON "sent_messages"("job_id", "platform_id", "target_chat_id");

-- CreateIndex
CREATE INDEX "received_reactions_project_id_idx" ON "received_reactions"("project_id");

-- CreateIndex
CREATE INDEX "received_reactions_platform_id_idx" ON "received_reactions"("platform_id");

-- CreateIndex
CREATE INDEX "received_reactions_received_at_idx" ON "received_reactions"("received_at");

-- CreateIndex
CREATE INDEX "received_reactions_provider_chat_id_idx" ON "received_reactions"("provider_chat_id");

-- CreateIndex
CREATE INDEX "received_reactions_provider_user_id_idx" ON "received_reactions"("provider_user_id");

-- CreateIndex
CREATE INDEX "received_reactions_provider_message_id_idx" ON "received_reactions"("provider_message_id");

-- CreateIndex
CREATE INDEX "received_reactions_reaction_type_idx" ON "received_reactions"("reaction_type");

-- CreateIndex
CREATE INDEX "received_reactions_platform_id_provider_user_id_idx" ON "received_reactions"("platform_id", "provider_user_id");

-- CreateIndex
CREATE INDEX "received_reactions_project_id_provider_message_id_provider__idx" ON "received_reactions"("project_id", "provider_message_id", "provider_user_id", "reaction_type", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "received_reactions_platform_id_provider_message_id_provider_key" ON "received_reactions"("platform_id", "provider_message_id", "provider_user_id", "emoji", "reaction_type");

-- CreateIndex
CREATE INDEX "platform_logs_project_id_idx" ON "platform_logs"("project_id");

-- CreateIndex
CREATE INDEX "platform_logs_platform_id_idx" ON "platform_logs"("platform_id");

-- CreateIndex
CREATE INDEX "platform_logs_timestamp_idx" ON "platform_logs"("timestamp");

-- CreateIndex
CREATE INDEX "platform_logs_level_idx" ON "platform_logs"("level");

-- CreateIndex
CREATE INDEX "platform_logs_category_idx" ON "platform_logs"("category");

-- CreateIndex
CREATE INDEX "webhooks_project_id_idx" ON "webhooks"("project_id");

-- CreateIndex
CREATE INDEX "webhooks_project_id_is_active_idx" ON "webhooks"("project_id", "is_active");

-- CreateIndex
CREATE INDEX "webhook_deliveries_webhook_id_idx" ON "webhook_deliveries"("webhook_id");

-- CreateIndex
CREATE INDEX "webhook_deliveries_created_at_idx" ON "webhook_deliveries"("created_at");

-- CreateIndex
CREATE INDEX "webhook_deliveries_status_idx" ON "webhook_deliveries"("status");

-- CreateIndex
CREATE INDEX "webhook_deliveries_event_idx" ON "webhook_deliveries"("event");

-- CreateIndex
CREATE INDEX "identities_project_id_idx" ON "identities"("project_id");

-- CreateIndex
CREATE INDEX "identities_project_id_email_idx" ON "identities"("project_id", "email");

-- CreateIndex
CREATE INDEX "identities_project_id_display_name_idx" ON "identities"("project_id", "display_name");

-- CreateIndex
CREATE INDEX "identity_aliases_identity_id_idx" ON "identity_aliases"("identity_id");

-- CreateIndex
CREATE INDEX "identity_aliases_project_id_idx" ON "identity_aliases"("project_id");

-- CreateIndex
CREATE INDEX "identity_aliases_provider_user_id_idx" ON "identity_aliases"("provider_user_id");

-- CreateIndex
CREATE INDEX "identity_aliases_platform_id_provider_user_id_idx" ON "identity_aliases"("platform_id", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "identity_aliases_platform_id_provider_user_id_key" ON "identity_aliases"("platform_id", "provider_user_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_scopes" ADD CONSTRAINT "api_key_scopes_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_platforms" ADD CONSTRAINT "project_platforms_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_usage" ADD CONSTRAINT "api_key_usage_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "received_messages" ADD CONSTRAINT "received_messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "received_messages" ADD CONSTRAINT "received_messages_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "project_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_messages" ADD CONSTRAINT "sent_messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_messages" ADD CONSTRAINT "sent_messages_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "project_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "received_reactions" ADD CONSTRAINT "received_reactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "received_reactions" ADD CONSTRAINT "received_reactions_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "project_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_logs" ADD CONSTRAINT "platform_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_logs" ADD CONSTRAINT "platform_logs_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "project_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_id_fkey" FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identities" ADD CONSTRAINT "identities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_aliases" ADD CONSTRAINT "identity_aliases_identity_id_fkey" FOREIGN KEY ("identity_id") REFERENCES "identities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_aliases" ADD CONSTRAINT "identity_aliases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_aliases" ADD CONSTRAINT "identity_aliases_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "project_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
