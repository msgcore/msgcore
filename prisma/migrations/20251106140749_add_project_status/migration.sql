-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");
