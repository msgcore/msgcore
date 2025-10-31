-- CreateTable
CREATE TABLE "entity_schemas" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "extraction_type" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "prompt" TEXT,
    "model" TEXT,
    "temperature" DOUBLE PRECISION,
    "rule_definition" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_profiles" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "graph_definition" JSONB NOT NULL,
    "entity_schema_ids" TEXT[],
    "trigger_on_receive" BOOLEAN NOT NULL DEFAULT false,
    "trigger_on_schedule" TEXT,
    "trigger_on_demand" BOOLEAN NOT NULL DEFAULT true,
    "store_entities" BOOLEAN NOT NULL DEFAULT true,
    "generate_tags" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_runs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "profile_version" INTEGER NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_ids" TEXT[],
    "date_range_start" TIMESTAMP(3),
    "date_range_end" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "entities_extracted" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "tokens_used" INTEGER,
    "estimated_cost_usd" DOUBLE PRECISION,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_entities" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "entity_schema_id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "profile_version" INTEGER NOT NULL,
    "properties" JSONB NOT NULL,
    "identity_id" TEXT,
    "chat_id" TEXT,
    "source_message_ids" TEXT[],
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "confidence" DOUBLE PRECISION,
    "extracted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extracted_entities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entity_schemas_project_id_is_active_idx" ON "entity_schemas"("project_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "entity_schemas_project_id_name_key" ON "entity_schemas"("project_id", "name");

-- CreateIndex
CREATE INDEX "analysis_profiles_project_id_is_active_idx" ON "analysis_profiles"("project_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_profiles_project_id_name_version_key" ON "analysis_profiles"("project_id", "name", "version");

-- CreateIndex
CREATE INDEX "analysis_runs_project_id_status_idx" ON "analysis_runs"("project_id", "status");

-- CreateIndex
CREATE INDEX "analysis_runs_profile_id_created_at_idx" ON "analysis_runs"("profile_id", "created_at");

-- CreateIndex
CREATE INDEX "extracted_entities_project_id_entity_schema_id_is_latest_idx" ON "extracted_entities"("project_id", "entity_schema_id", "is_latest");

-- CreateIndex
CREATE INDEX "extracted_entities_identity_id_extracted_at_idx" ON "extracted_entities"("identity_id", "extracted_at");

-- CreateIndex
CREATE INDEX "extracted_entities_chat_id_extracted_at_idx" ON "extracted_entities"("chat_id", "extracted_at");

-- CreateIndex
CREATE INDEX "extracted_entities_run_id_idx" ON "extracted_entities"("run_id");

-- AddForeignKey
ALTER TABLE "entity_schemas" ADD CONSTRAINT "entity_schemas_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_profiles" ADD CONSTRAINT "analysis_profiles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "analysis_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_entities" ADD CONSTRAINT "extracted_entities_entity_schema_id_fkey" FOREIGN KEY ("entity_schema_id") REFERENCES "entity_schemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_entities" ADD CONSTRAINT "extracted_entities_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "analysis_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_entities" ADD CONSTRAINT "extracted_entities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_entities" ADD CONSTRAINT "extracted_entities_identity_id_fkey" FOREIGN KEY ("identity_id") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_entities" ADD CONSTRAINT "extracted_entities_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
