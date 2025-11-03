/*
  Warnings:

  - Added the required column `password` to the `apply_tenant_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apply_tenant_users" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT;
