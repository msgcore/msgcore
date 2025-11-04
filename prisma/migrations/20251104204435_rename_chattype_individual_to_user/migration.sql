/*
  Warnings:

  - The values [individual] on the enum `ChatType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
-- First, add 'user' to the existing enum
ALTER TYPE "ChatType" ADD VALUE IF NOT EXISTS 'user';
COMMIT;

-- Update all 'individual' values to 'user'
BEGIN;
UPDATE "chats" SET "chat_type" = 'user'::"ChatType" WHERE "chat_type" = 'individual'::"ChatType";
COMMIT;

-- Now remove 'individual' from the enum
BEGIN;
CREATE TYPE "ChatType_new" AS ENUM ('user', 'group', 'channel');
ALTER TABLE "chats" ALTER COLUMN "chat_type" TYPE "ChatType_new" USING ("chat_type"::text::"ChatType_new");
ALTER TYPE "ChatType" RENAME TO "ChatType_old";
ALTER TYPE "ChatType_new" RENAME TO "ChatType";
DROP TYPE "ChatType_old";
COMMIT;
