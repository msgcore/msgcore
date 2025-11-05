-- CreateTable
CREATE TABLE "baileys_auth_states" (
    "id" TEXT NOT NULL,
    "connection_key" TEXT NOT NULL,
    "creds" TEXT NOT NULL,
    "keys" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baileys_auth_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "baileys_auth_states_connection_key_key" ON "baileys_auth_states"("connection_key");

-- CreateIndex
CREATE INDEX "baileys_auth_states_connection_key_idx" ON "baileys_auth_states"("connection_key");
