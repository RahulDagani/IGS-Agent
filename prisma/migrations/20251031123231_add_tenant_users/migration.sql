-- AlterTable
ALTER TABLE "apply_tenants" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "apply_tenant_users" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apply_tenant_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apply_tenant_user_auth_providers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT,
    "email" TEXT,
    "password_hash" TEXT,
    "access_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apply_tenant_user_auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apply_tenant_users_email_key" ON "apply_tenant_users"("email");

-- CreateIndex
CREATE INDEX "apply_tenant_users_tenant_id_idx" ON "apply_tenant_users"("tenant_id");

-- CreateIndex
CREATE INDEX "apply_tenant_user_auth_providers_user_id_idx" ON "apply_tenant_user_auth_providers"("user_id");

-- AddForeignKey
ALTER TABLE "apply_tenant_user_auth_providers" ADD CONSTRAINT "apply_tenant_user_auth_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "apply_tenant_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
