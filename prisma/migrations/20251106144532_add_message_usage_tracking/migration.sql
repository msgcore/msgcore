-- CreateTable
CREATE TABLE "message_usage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "messages_sent" INTEGER NOT NULL DEFAULT 0,
    "messages_received" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_usage_user_id_year_month_idx" ON "message_usage"("user_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "message_usage_user_id_year_month_key" ON "message_usage"("user_id", "year", "month");

-- AddForeignKey
ALTER TABLE "message_usage" ADD CONSTRAINT "message_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
