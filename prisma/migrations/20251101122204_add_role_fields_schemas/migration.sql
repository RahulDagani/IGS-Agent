-- CreateTable
CREATE TABLE "apply_role_fields_sections" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '1',
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apply_role_fields_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apply_role_field_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '1',
    "section_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "options" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apply_role_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apply_user_field_values" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '1',
    "field_id" TEXT NOT NULL,
    "field_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apply_user_field_values_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "apply_role_field_definitions" ADD CONSTRAINT "apply_role_field_definitions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "apply_role_fields_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apply_user_field_values" ADD CONSTRAINT "apply_user_field_values_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "apply_role_field_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
