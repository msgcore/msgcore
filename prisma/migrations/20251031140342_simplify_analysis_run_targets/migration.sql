/*
  Warnings:

  - You are about to drop the column `target_ids` on the `analysis_runs` table. All the data in the column will be lost.
  - You are about to drop the column `target_type` on the `analysis_runs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "analysis_runs" DROP COLUMN "target_ids",
DROP COLUMN "target_type",
ADD COLUMN     "chat_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "identity_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
