/*
  Warnings:

  - The required column `uuid` was added to the `apply_tenant_users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "apply_tenant_users" ADD COLUMN     "agent_id" INTEGER,
ADD COLUMN     "is_allowed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "uuid" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "apply_tenant_users_agent_id_idx" ON "apply_tenant_users"("agent_id");

-- AddForeignKey
ALTER TABLE "apply_tenant_users" ADD CONSTRAINT "apply_tenant_users_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "apply_tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
