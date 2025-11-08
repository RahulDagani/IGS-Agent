-- CreateTable
CREATE TABLE "apply_agent_meta" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255),
    "business_name" VARCHAR(255) NOT NULL,
    "business_certificate" VARCHAR(255),
    "agency_logo" VARCHAR(255) DEFAULT 'logo.png',
    "pan_card_upload" VARCHAR(255),
    "country" VARCHAR(100) NOT NULL,
    "street_address" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "website_url" VARCHAR(255),
    "instagram" VARCHAR(255),
    "facebook" VARCHAR(255),
    "linkedin" VARCHAR(255),
    "twitter" VARCHAR(255),
    "other" VARCHAR(255),
    "whatsapp_id" VARCHAR(50),
    "skype_id" VARCHAR(50),
    "ifsc_code" VARCHAR(50),
    "bank_account_number" VARCHAR(255),
    "bank_account_name" VARCHAR(50),
    "is_payment_verified" BOOLEAN DEFAULT false,
    "is_admin_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "apply_agent_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apply_agent_meta_uuid_key" ON "apply_agent_meta"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "apply_agent_meta_user_id_key" ON "apply_agent_meta"("user_id");

-- CreateIndex
CREATE INDEX "apply_agent_meta_tenant_id_idx" ON "apply_agent_meta"("tenant_id");

-- CreateIndex
CREATE INDEX "apply_agent_meta_user_id_idx" ON "apply_agent_meta"("user_id");

-- CreateIndex
CREATE INDEX "apply_agent_meta_business_name_idx" ON "apply_agent_meta"("business_name");

-- CreateIndex
CREATE INDEX "apply_agent_meta_country_idx" ON "apply_agent_meta"("country");

-- CreateIndex
CREATE INDEX "apply_agent_meta_is_payment_verified_idx" ON "apply_agent_meta"("is_payment_verified");

-- CreateIndex
CREATE INDEX "apply_agent_meta_is_admin_verified_idx" ON "apply_agent_meta"("is_admin_verified");

-- CreateIndex
CREATE INDEX "apply_agent_meta_created_at_idx" ON "apply_agent_meta"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "apply_agent_meta_tenant_id_user_id_key" ON "apply_agent_meta"("tenant_id", "user_id");

-- AddForeignKey
ALTER TABLE "apply_agent_meta" ADD CONSTRAINT "apply_agent_meta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "apply_tenant_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
