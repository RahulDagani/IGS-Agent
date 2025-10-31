-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('pending', 'paid');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'BACKUP', 'RESTORE', 'APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE', 'RESET_PASSWORD', 'CHANGE_ROLE', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_EXPIRED', 'DOMAIN_CONNECTED', 'DOMAIN_REJECTED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'TENANT', 'PLAN', 'PAYMENT', 'DOMAIN_REQUEST', 'DOMAIN', 'SUBSCRIPTION_REQUEST', 'SUBSCRIPTION', 'NEWSLETTER_SUBSCRIBER', 'NEWSLETTER_CAMPAIGN', 'PAGE', 'WEBSITE_SECTION', 'FEATURE_ELEMENT', 'WHY_US_ELEMENT', 'EXPLORER_ELEMENT', 'ALL_FEATURE_ELEMENT', 'SOFTWARE_ELEMENT', 'TESTIMONIAL_ELEMENT', 'BRAND_ELEMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ElementStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('INFORMATION', 'NEED_HELP', 'LEGAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignAudience" AS ENUM ('ALL_SUBSCRIBERS', 'ACTIVE_SUBSCRIBERS', 'TENANTS', 'SPECIFIC_USERS');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "SubscriptionRequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED', 'PENDING_RENEWAL');

-- CreateEnum
CREATE TYPE "DomainRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CONNECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'TENANT_ADMIN', 'TENANT_SUB_ADMIN', 'TENANT_EMPLOYEE', 'STUDENT', 'AGENT', 'AGENT_STUDENT', 'UNIVERSITY');

-- CreateTable
CREATE TABLE "tech_users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "ios_user_id" VARCHAR(255),
    "name" VARCHAR(255),
    "email" VARCHAR(128),
    "device_type" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255),
    "country_code" VARCHAR(11),
    "mobile" VARCHAR(20),
    "otp" VARCHAR(128),
    "terms_of_use" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "firebase_device_token" TEXT,
    "password" VARCHAR(255),
    "role" "UserRole" NOT NULL,
    "roleId" TEXT,
    "register_by" BIGINT,
    "employee_code" VARCHAR(255),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_tenants" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "planId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "onTrial" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_plan_features" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "limitClients" INTEGER NOT NULL,
    "limitSuppliers" INTEGER NOT NULL,
    "limitEmployees" INTEGER NOT NULL,
    "limitDomains" INTEGER NOT NULL,
    "limitInvoices" INTEGER NOT NULL,
    "limitPurchases" INTEGER NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_payments" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "trxId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_domain_requests" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "DomainRequestStatus" NOT NULL DEFAULT 'PENDING',
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_domain_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_domains" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_subscription_requests" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "transactionId" TEXT,
    "documentPath" TEXT,
    "month" TEXT NOT NULL,
    "status" "SubscriptionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_subscription_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_subscriptions" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "approvedBy" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_newsletter_subscribers" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "source" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_newsletter_campaigns" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "sentTo" "CampaignAudience" NOT NULL DEFAULT 'ALL_SUBSCRIBERS',
    "greeting" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "sentBy" INTEGER,
    "sentAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "recipientCount" INTEGER,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_campaign_recipients" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "subscriberId" INTEGER,
    "email" VARCHAR(255) NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bounceReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_campaign_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_pages" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "PageType" NOT NULL DEFAULT 'INFORMATION',
    "status" "PageStatus" NOT NULL DEFAULT 'ACTIVE',
    "metaTitle" VARCHAR(255),
    "metaDescription" VARCHAR(500),
    "metaKeywords" VARCHAR(500),
    "featuredImage" TEXT,
    "authorId" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_website_sections" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section_key" TEXT NOT NULL,
    "section_name" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "show_on_landing" BOOLEAN NOT NULL DEFAULT true,
    "status" "SectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_website_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_feature_elements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" "ElementStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_feature_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_why_us_elements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" "ElementStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_why_us_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_explorer_elements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" "ElementStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_explorer_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_all_feature_elements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" "ElementStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_all_feature_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_software_elements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section_id" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "status" "ElementStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_software_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_testimonial_elements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "rating" INTEGER,
    "company" TEXT,
    "status" "ElementStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_testimonial_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_brand_elements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "website_url" TEXT,
    "status" "ElementStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_brand_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_activity_logs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER,
    "user_name" TEXT,
    "user_email" TEXT,
    "user_role" "UserRole",
    "action" "LogAction" NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" INTEGER,
    "entity_name" TEXT,
    "description" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "location" TEXT,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "status" "LogStatus" NOT NULL DEFAULT 'SUCCESS',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_general_settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyTagline" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT,
    "yearlyPlanDiscount" DOUBLE PRECISION,
    "trialDayCount" INTEGER NOT NULL,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "copyrightText" TEXT NOT NULL,
    "facebookLink" TEXT,
    "instagramLink" TEXT,
    "twitterLink" TEXT,
    "linkedinLink" TEXT,
    "whiteLogo" TEXT,
    "blackLogo" TEXT,
    "smallLogo" TEXT,
    "favicon" TEXT,
    "emailOtpVerification" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_general_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_mail_configurations" (
    "id" TEXT NOT NULL,
    "mailer" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "encryption" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "fromName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_mail_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_sms_configurations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'twilio',
    "accountSid" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "fromNumber" TEXT NOT NULL,
    "serviceSid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_sms_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_currencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "symbol" TEXT NOT NULL,
    "position" TEXT NOT NULL DEFAULT 'left',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_payment_settings" (
    "id" TEXT NOT NULL,
    "manualPayment" JSONB,
    "stripe" JSONB,
    "paypal" JSONB,
    "paystack" JSONB,
    "razorpay" JSONB,
    "currencyExchange" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_payment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tech_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_tenant_users" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_tenant_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_student_meta" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "salutation" VARCHAR(50),
    "first_name" VARCHAR(255) NOT NULL,
    "middle_name" VARCHAR(255),
    "last_name" VARCHAR(255) NOT NULL,
    "alternate_email" VARCHAR(255),
    "country_code" VARCHAR(10),
    "alternate_phone_number" VARCHAR(20),
    "dob" TIMESTAMP(3),
    "gender" VARCHAR(50),
    "citizenship" VARCHAR(100),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "zip_code" VARCHAR(20),
    "emergency_c_name" VARCHAR(255),
    "emergency_c_relation" VARCHAR(100),
    "emergency_c_email" VARCHAR(255),
    "emergency_c_phone" VARCHAR(20),
    "profile" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_student_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_student_interests" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "preferred_country" VARCHAR(100),
    "level_of_study" VARCHAR(100),
    "discipline" VARCHAR(100),
    "sat_score" INTEGER,
    "act_score" INTEGER,
    "toefl_score" INTEGER,
    "pte_score" INTEGER,
    "duolingo_score" INTEGER,
    "ielts_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_student_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_agent_student_meta" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "salutation" VARCHAR(50),
    "first_name" VARCHAR(255) NOT NULL,
    "middle_name" VARCHAR(255),
    "last_name" VARCHAR(255) NOT NULL,
    "alternate_email" VARCHAR(255),
    "country_code" VARCHAR(10),
    "alternate_phone_number" VARCHAR(20),
    "dob" TIMESTAMP(3),
    "gender" VARCHAR(50),
    "citizenship" VARCHAR(100),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "zip_code" VARCHAR(20),
    "emergency_c_name" VARCHAR(255),
    "emergency_c_relation" VARCHAR(100),
    "emergency_c_email" VARCHAR(255),
    "emergency_c_phone" VARCHAR(20),
    "profile" VARCHAR(500),
    "agent_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_agent_student_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_agent_student_interests" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "preferred_country" VARCHAR(100),
    "level_of_study" VARCHAR(100),
    "discipline" VARCHAR(100),
    "sat_score" INTEGER,
    "act_score" INTEGER,
    "toefl_score" INTEGER,
    "pte_score" INTEGER,
    "duolingo_score" INTEGER,
    "ielts_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_agent_student_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_agents" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255),
    "business_name" VARCHAR(255) NOT NULL,
    "business_certificate" VARCHAR(255),
    "agency_logo" VARCHAR(255),
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
    "is_payment_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_admin_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_countries" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "country" VARCHAR(255) NOT NULL,
    "country_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_states" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "state" VARCHAR(255) NOT NULL,
    "state_slug" VARCHAR(255) NOT NULL,
    "country_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_cities" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "city" VARCHAR(255) NOT NULL,
    "state_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_study_levels" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "study_level" VARCHAR(255) NOT NULL,
    "studylevel_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_study_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_disciplines" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "discipline" VARCHAR(255) NOT NULL,
    "discipline_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_partner_types" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "kind_of_partners" VARCHAR(255) NOT NULL,
    "kind_of_partners_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_partner_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_university_types" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "type_of_university" VARCHAR(255) NOT NULL,
    "type_of_university_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_university_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_intakes" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "intake" VARCHAR(255) NOT NULL,
    "intake_slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_intakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_universities" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "university" VARCHAR(255) NOT NULL,
    "university_slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "country_id" INTEGER NOT NULL,
    "state_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "address" TEXT,
    "map_url" TEXT,
    "location_url" TEXT,
    "kind_of_partners_id" INTEGER NOT NULL,
    "type_of_university_id" INTEGER NOT NULL,
    "collaboration" VARCHAR(50) NOT NULL,
    "partner" VARCHAR(10) NOT NULL,
    "logo" VARCHAR(255),
    "image" VARCHAR(255),
    "brocher" VARCHAR(255),
    "video_link" TEXT,
    "tution_url" VARCHAR(255),
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_university_courses" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "university_id" INTEGER NOT NULL,
    "course" VARCHAR(255) NOT NULL,
    "course_slug" VARCHAR(255) NOT NULL,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "country_id" INTEGER NOT NULL,
    "state_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "study_level_id" INTEGER NOT NULL,
    "discipline_id" INTEGER NOT NULL,
    "kind_of_partners_id" INTEGER NOT NULL,
    "type_of_university_id" INTEGER NOT NULL,
    "intake_id" INTEGER,
    "gre_score" VARCHAR(255),
    "gmat_score" VARCHAR(255),
    "ielts_score" VARCHAR(255),
    "toefl_score" VARCHAR(255),
    "pte_score" VARCHAR(255),
    "sat_score" VARCHAR(255),
    "act_score" VARCHAR(255),
    "duolingo_score" VARCHAR(255),
    "gpa_score" VARCHAR(255),
    "tution_fees" VARCHAR(255),
    "application_fee" VARCHAR(255),
    "external_evaluation" VARCHAR(255),
    "about_the_course" TEXT,
    "admission_requirements" TEXT,
    "application_deadline" TEXT,
    "tuition_fee" TEXT,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_university_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_applications_status" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "status" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_applications_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_student_applications" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "portal_student_id" VARCHAR(20),
    "application_login" VARCHAR(255),
    "application_password" VARCHAR(255),
    "university_slug" VARCHAR(255) NOT NULL,
    "level_slug" VARCHAR(255) NOT NULL,
    "discipline_slug" VARCHAR(255) NOT NULL,
    "course_slug" VARCHAR(255) NOT NULL,
    "intake_slug" VARCHAR(255) NOT NULL,
    "year" VARCHAR(255) NOT NULL,
    "applied_date" VARCHAR(255) NOT NULL,
    "status_id" INTEGER,
    "application_status_id" INTEGER NOT NULL DEFAULT 1,
    "fee_status" "FeeStatus",
    "assigned_to" INTEGER NOT NULL,
    "sender_id" INTEGER,
    "notification" INTEGER,
    "front_notification" INTEGER,
    "high_school_file" VARCHAR(255),
    "higher_education_file" VARCHAR(255),
    "degree_certificate" VARCHAR(255),
    "passport_file" VARCHAR(255),
    "gre_gmat_file" VARCHAR(255),
    "act_sat_file" VARCHAR(255),
    "english_language_score_file" VARCHAR(255),
    "resume_file" VARCHAR(255),
    "sop_file" VARCHAR(255),
    "lor_file" VARCHAR(255),
    "financial_file" VARCHAR(255),
    "additional_file" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_student_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_agent_student_applications" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "agent_student_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "portal_student_id" VARCHAR(20),
    "application_login" VARCHAR(255),
    "application_password" VARCHAR(255),
    "university_slug" VARCHAR(255) NOT NULL,
    "level_slug" VARCHAR(255) NOT NULL,
    "discipline_slug" VARCHAR(255) NOT NULL,
    "course_slug" VARCHAR(255) NOT NULL,
    "intake_slug" VARCHAR(255) NOT NULL,
    "year" VARCHAR(255) NOT NULL,
    "applied_date" VARCHAR(255) NOT NULL,
    "status_id" INTEGER,
    "application_status_id" INTEGER NOT NULL DEFAULT 1,
    "fee_status" "FeeStatus",
    "assigned_to" INTEGER NOT NULL,
    "designated_contact_id" INTEGER NOT NULL,
    "sender_id" INTEGER,
    "notification" INTEGER,
    "front_notification" INTEGER,
    "high_school_file" VARCHAR(255),
    "higher_education_file" VARCHAR(255),
    "degree_certificate" VARCHAR(255),
    "passport_file" VARCHAR(255),
    "gre_gmat_file" VARCHAR(255),
    "act_sat_file" VARCHAR(255),
    "english_language_score_file" VARCHAR(255),
    "resume_file" VARCHAR(255),
    "sop_file" VARCHAR(255),
    "lor_file" VARCHAR(255),
    "financial_file" VARCHAR(255),
    "additional_file" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_agent_student_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_track_student_app_status" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "application_id" INTEGER NOT NULL,
    "applied" TIMESTAMP(3),
    "received" TIMESTAMP(3),
    "incomplete_application" TIMESTAMP(3),
    "documents_pending" TIMESTAMP(3),
    "application_complete" TIMESTAMP(3),
    "application_submitted_to_university" TIMESTAMP(3),
    "fully_admitted" TIMESTAMP(3),
    "conditionally_admitted" TIMESTAMP(3),
    "denied" TIMESTAMP(3),
    "i20_issued" TIMESTAMP(3),
    "i20_received" TIMESTAMP(3),
    "visa_appointment" TIMESTAMP(3),
    "visa_approved" TIMESTAMP(3),
    "visa_denied" TIMESTAMP(3),
    "deferred_admission" TIMESTAMP(3),
    "arrived_on_campus" TIMESTAMP(3),
    "application_withdrawn" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_track_student_app_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_track_agent_app_status" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "agent_student_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "application_id" INTEGER NOT NULL,
    "applied" TIMESTAMP(3),
    "received" TIMESTAMP(3),
    "incomplete_application" TIMESTAMP(3),
    "documents_pending" TIMESTAMP(3),
    "application_complete" TIMESTAMP(3),
    "application_submitted_to_university" TIMESTAMP(3),
    "fully_admitted" TIMESTAMP(3),
    "conditionally_admitted" TIMESTAMP(3),
    "denied" TIMESTAMP(3),
    "i20_issued" TIMESTAMP(3),
    "i20_received" TIMESTAMP(3),
    "visa_appointment" TIMESTAMP(3),
    "visa_approved" TIMESTAMP(3),
    "visa_denied" TIMESTAMP(3),
    "deferred_admission" TIMESTAMP(3),
    "arrived_on_campus" TIMESTAMP(3),
    "application_withdrawn" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_track_agent_app_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_student_required_docs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "study_level" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "document_key" VARCHAR(255) NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_student_required_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_agent_student_required_docs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "study_level" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "document_key" VARCHAR(255) NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_agent_student_required_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_student_app_required_docs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "application_id" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "document_key" VARCHAR(255) NOT NULL,
    "link" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_student_app_required_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_agent_student_app_required_docs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "application_id" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "document_key" VARCHAR(255) NOT NULL,
    "link" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_agent_student_app_required_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_student_application_docs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "application_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type_id" INTEGER NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DocStatus" NOT NULL DEFAULT 'Pending',
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_student_application_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_agent_student_application_docs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "application_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type_id" INTEGER NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DocStatus" NOT NULL DEFAULT 'Pending',
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_agent_student_application_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_student_docs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type_id" INTEGER NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DocStatus" NOT NULL DEFAULT 'Pending',
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_student_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_agent_student_docs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type_id" INTEGER NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DocStatus" NOT NULL DEFAULT 'Pending',
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tech_agent_student_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlanFeatures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PlanFeatures_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tech_users_uuid_key" ON "tech_users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_users_email_key" ON "tech_users"("email");

-- CreateIndex
CREATE INDEX "tech_users_ios_user_id_idx" ON "tech_users"("ios_user_id");

-- CreateIndex
CREATE INDEX "tech_users_mobile_idx" ON "tech_users"("mobile");

-- CreateIndex
CREATE INDEX "tech_users_roleId_idx" ON "tech_users"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "tech_tenants_domain_key" ON "tech_tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tech_tenants_email_key" ON "tech_tenants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tech_plan_features_name_key" ON "tech_plan_features"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tech_plans_name_key" ON "tech_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tech_payments_uuid_key" ON "tech_payments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_payments_trxId_key" ON "tech_payments"("trxId");

-- CreateIndex
CREATE INDEX "tech_payments_trxId_idx" ON "tech_payments"("trxId");

-- CreateIndex
CREATE INDEX "tech_payments_paymentStatus_idx" ON "tech_payments"("paymentStatus");

-- CreateIndex
CREATE INDEX "tech_payments_createdAt_idx" ON "tech_payments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tech_domain_requests_uuid_key" ON "tech_domain_requests"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_domain_requests_domain_key" ON "tech_domain_requests"("domain");

-- CreateIndex
CREATE INDEX "tech_domain_requests_domain_idx" ON "tech_domain_requests"("domain");

-- CreateIndex
CREATE INDEX "tech_domain_requests_status_idx" ON "tech_domain_requests"("status");

-- CreateIndex
CREATE INDEX "tech_domain_requests_createdAt_idx" ON "tech_domain_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tech_domains_uuid_key" ON "tech_domains"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_domains_domain_key" ON "tech_domains"("domain");

-- CreateIndex
CREATE INDEX "tech_domains_domain_idx" ON "tech_domains"("domain");

-- CreateIndex
CREATE INDEX "tech_domains_isActive_idx" ON "tech_domains"("isActive");

-- CreateIndex
CREATE INDEX "tech_domains_createdAt_idx" ON "tech_domains"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tech_subscription_requests_uuid_key" ON "tech_subscription_requests"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_subscription_requests_transactionId_key" ON "tech_subscription_requests"("transactionId");

-- CreateIndex
CREATE INDEX "tech_subscription_requests_transactionId_idx" ON "tech_subscription_requests"("transactionId");

-- CreateIndex
CREATE INDEX "tech_subscription_requests_status_idx" ON "tech_subscription_requests"("status");

-- CreateIndex
CREATE INDEX "tech_subscription_requests_requestedAt_idx" ON "tech_subscription_requests"("requestedAt");

-- CreateIndex
CREATE INDEX "tech_subscription_requests_month_idx" ON "tech_subscription_requests"("month");

-- CreateIndex
CREATE UNIQUE INDEX "tech_subscriptions_uuid_key" ON "tech_subscriptions"("uuid");

-- CreateIndex
CREATE INDEX "tech_subscriptions_month_idx" ON "tech_subscriptions"("month");

-- CreateIndex
CREATE INDEX "tech_subscriptions_status_idx" ON "tech_subscriptions"("status");

-- CreateIndex
CREATE INDEX "tech_subscriptions_startsAt_idx" ON "tech_subscriptions"("startsAt");

-- CreateIndex
CREATE INDEX "tech_subscriptions_endsAt_idx" ON "tech_subscriptions"("endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "tech_subscriptions_tenantId_month_key" ON "tech_subscriptions"("tenantId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "tech_newsletter_subscribers_uuid_key" ON "tech_newsletter_subscribers"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_newsletter_subscribers_email_key" ON "tech_newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "tech_newsletter_subscribers_email_idx" ON "tech_newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "tech_newsletter_subscribers_isActive_idx" ON "tech_newsletter_subscribers"("isActive");

-- CreateIndex
CREATE INDEX "tech_newsletter_subscribers_subscribedAt_idx" ON "tech_newsletter_subscribers"("subscribedAt");

-- CreateIndex
CREATE UNIQUE INDEX "tech_newsletter_campaigns_uuid_key" ON "tech_newsletter_campaigns"("uuid");

-- CreateIndex
CREATE INDEX "tech_newsletter_campaigns_status_idx" ON "tech_newsletter_campaigns"("status");

-- CreateIndex
CREATE INDEX "tech_newsletter_campaigns_sentAt_idx" ON "tech_newsletter_campaigns"("sentAt");

-- CreateIndex
CREATE INDEX "tech_newsletter_campaigns_scheduledAt_idx" ON "tech_newsletter_campaigns"("scheduledAt");

-- CreateIndex
CREATE INDEX "tech_newsletter_campaigns_createdAt_idx" ON "tech_newsletter_campaigns"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tech_campaign_recipients_uuid_key" ON "tech_campaign_recipients"("uuid");

-- CreateIndex
CREATE INDEX "tech_campaign_recipients_campaignId_idx" ON "tech_campaign_recipients"("campaignId");

-- CreateIndex
CREATE INDEX "tech_campaign_recipients_subscriberId_idx" ON "tech_campaign_recipients"("subscriberId");

-- CreateIndex
CREATE INDEX "tech_campaign_recipients_email_idx" ON "tech_campaign_recipients"("email");

-- CreateIndex
CREATE INDEX "tech_campaign_recipients_status_idx" ON "tech_campaign_recipients"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tech_campaign_recipients_campaignId_email_key" ON "tech_campaign_recipients"("campaignId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "tech_pages_uuid_key" ON "tech_pages"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_pages_slug_key" ON "tech_pages"("slug");

-- CreateIndex
CREATE INDEX "tech_pages_slug_idx" ON "tech_pages"("slug");

-- CreateIndex
CREATE INDEX "tech_pages_type_idx" ON "tech_pages"("type");

-- CreateIndex
CREATE INDEX "tech_pages_status_idx" ON "tech_pages"("status");

-- CreateIndex
CREATE INDEX "tech_pages_createdAt_idx" ON "tech_pages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tech_website_sections_uuid_key" ON "tech_website_sections"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_website_sections_section_key_key" ON "tech_website_sections"("section_key");

-- CreateIndex
CREATE INDEX "tech_website_sections_section_key_idx" ON "tech_website_sections"("section_key");

-- CreateIndex
CREATE INDEX "tech_website_sections_status_idx" ON "tech_website_sections"("status");

-- CreateIndex
CREATE INDEX "tech_website_sections_show_on_landing_idx" ON "tech_website_sections"("show_on_landing");

-- CreateIndex
CREATE INDEX "tech_website_sections_order_index_idx" ON "tech_website_sections"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "tech_feature_elements_uuid_key" ON "tech_feature_elements"("uuid");

-- CreateIndex
CREATE INDEX "tech_feature_elements_section_id_idx" ON "tech_feature_elements"("section_id");

-- CreateIndex
CREATE INDEX "tech_feature_elements_status_idx" ON "tech_feature_elements"("status");

-- CreateIndex
CREATE INDEX "tech_feature_elements_order_index_idx" ON "tech_feature_elements"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "tech_why_us_elements_uuid_key" ON "tech_why_us_elements"("uuid");

-- CreateIndex
CREATE INDEX "tech_why_us_elements_section_id_idx" ON "tech_why_us_elements"("section_id");

-- CreateIndex
CREATE INDEX "tech_why_us_elements_status_idx" ON "tech_why_us_elements"("status");

-- CreateIndex
CREATE INDEX "tech_why_us_elements_order_index_idx" ON "tech_why_us_elements"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "tech_explorer_elements_uuid_key" ON "tech_explorer_elements"("uuid");

-- CreateIndex
CREATE INDEX "tech_explorer_elements_section_id_idx" ON "tech_explorer_elements"("section_id");

-- CreateIndex
CREATE INDEX "tech_explorer_elements_status_idx" ON "tech_explorer_elements"("status");

-- CreateIndex
CREATE INDEX "tech_explorer_elements_order_index_idx" ON "tech_explorer_elements"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "tech_all_feature_elements_uuid_key" ON "tech_all_feature_elements"("uuid");

-- CreateIndex
CREATE INDEX "tech_all_feature_elements_section_id_idx" ON "tech_all_feature_elements"("section_id");

-- CreateIndex
CREATE INDEX "tech_all_feature_elements_status_idx" ON "tech_all_feature_elements"("status");

-- CreateIndex
CREATE INDEX "tech_all_feature_elements_order_index_idx" ON "tech_all_feature_elements"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "tech_software_elements_uuid_key" ON "tech_software_elements"("uuid");

-- CreateIndex
CREATE INDEX "tech_software_elements_section_id_idx" ON "tech_software_elements"("section_id");

-- CreateIndex
CREATE INDEX "tech_software_elements_status_idx" ON "tech_software_elements"("status");

-- CreateIndex
CREATE INDEX "tech_software_elements_order_index_idx" ON "tech_software_elements"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "tech_testimonial_elements_uuid_key" ON "tech_testimonial_elements"("uuid");

-- CreateIndex
CREATE INDEX "tech_testimonial_elements_section_id_idx" ON "tech_testimonial_elements"("section_id");

-- CreateIndex
CREATE INDEX "tech_testimonial_elements_status_idx" ON "tech_testimonial_elements"("status");

-- CreateIndex
CREATE INDEX "tech_testimonial_elements_order_index_idx" ON "tech_testimonial_elements"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "tech_brand_elements_uuid_key" ON "tech_brand_elements"("uuid");

-- CreateIndex
CREATE INDEX "tech_brand_elements_section_id_idx" ON "tech_brand_elements"("section_id");

-- CreateIndex
CREATE INDEX "tech_brand_elements_status_idx" ON "tech_brand_elements"("status");

-- CreateIndex
CREATE INDEX "tech_brand_elements_order_index_idx" ON "tech_brand_elements"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "tech_activity_logs_uuid_key" ON "tech_activity_logs"("uuid");

-- CreateIndex
CREATE INDEX "tech_activity_logs_user_id_idx" ON "tech_activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "tech_activity_logs_action_idx" ON "tech_activity_logs"("action");

-- CreateIndex
CREATE INDEX "tech_activity_logs_entity_type_idx" ON "tech_activity_logs"("entity_type");

-- CreateIndex
CREATE INDEX "tech_activity_logs_entity_id_idx" ON "tech_activity_logs"("entity_id");

-- CreateIndex
CREATE INDEX "tech_activity_logs_severity_idx" ON "tech_activity_logs"("severity");

-- CreateIndex
CREATE INDEX "tech_activity_logs_created_at_idx" ON "tech_activity_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_currencies_code_key" ON "tech_currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tech_roles_name_key" ON "tech_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tech_permissions_name_key" ON "tech_permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tech_role_permissions_roleId_permissionId_key" ON "tech_role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "tech_tenant_users_tenantId_idx" ON "tech_tenant_users"("tenantId");

-- CreateIndex
CREATE INDEX "tech_tenant_users_userId_idx" ON "tech_tenant_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tech_tenant_users_tenantId_userId_key" ON "tech_tenant_users"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_meta_uuid_key" ON "tech_student_meta"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_meta_user_id_key" ON "tech_student_meta"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_meta_alternate_email_key" ON "tech_student_meta"("alternate_email");

-- CreateIndex
CREATE INDEX "tech_student_meta_tenant_id_idx" ON "tech_student_meta"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_student_meta_user_id_idx" ON "tech_student_meta"("user_id");

-- CreateIndex
CREATE INDEX "tech_student_meta_alternate_email_idx" ON "tech_student_meta"("alternate_email");

-- CreateIndex
CREATE INDEX "tech_student_meta_alternate_phone_number_idx" ON "tech_student_meta"("alternate_phone_number");

-- CreateIndex
CREATE INDEX "tech_student_meta_citizenship_idx" ON "tech_student_meta"("citizenship");

-- CreateIndex
CREATE INDEX "tech_student_meta_country_idx" ON "tech_student_meta"("country");

-- CreateIndex
CREATE INDEX "tech_student_meta_created_at_idx" ON "tech_student_meta"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_meta_tenant_id_user_id_key" ON "tech_student_meta"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_interests_uuid_key" ON "tech_student_interests"("uuid");

-- CreateIndex
CREATE INDEX "tech_student_interests_tenant_id_idx" ON "tech_student_interests"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_student_interests_student_id_idx" ON "tech_student_interests"("student_id");

-- CreateIndex
CREATE INDEX "tech_student_interests_preferred_country_idx" ON "tech_student_interests"("preferred_country");

-- CreateIndex
CREATE INDEX "tech_student_interests_level_of_study_idx" ON "tech_student_interests"("level_of_study");

-- CreateIndex
CREATE INDEX "tech_student_interests_discipline_idx" ON "tech_student_interests"("discipline");

-- CreateIndex
CREATE INDEX "tech_student_interests_created_at_idx" ON "tech_student_interests"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_interests_tenant_id_student_id_key" ON "tech_student_interests"("tenant_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_meta_uuid_key" ON "tech_agent_student_meta"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_meta_user_id_key" ON "tech_agent_student_meta"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_meta_alternate_email_key" ON "tech_agent_student_meta"("alternate_email");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_meta_agent_id_key" ON "tech_agent_student_meta"("agent_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_meta_tenant_id_idx" ON "tech_agent_student_meta"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_meta_user_id_idx" ON "tech_agent_student_meta"("user_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_meta_agent_id_idx" ON "tech_agent_student_meta"("agent_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_meta_alternate_email_idx" ON "tech_agent_student_meta"("alternate_email");

-- CreateIndex
CREATE INDEX "tech_agent_student_meta_alternate_phone_number_idx" ON "tech_agent_student_meta"("alternate_phone_number");

-- CreateIndex
CREATE INDEX "tech_agent_student_meta_citizenship_idx" ON "tech_agent_student_meta"("citizenship");

-- CreateIndex
CREATE INDEX "tech_agent_student_meta_country_idx" ON "tech_agent_student_meta"("country");

-- CreateIndex
CREATE INDEX "tech_agent_student_meta_created_at_idx" ON "tech_agent_student_meta"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_meta_tenant_id_user_id_key" ON "tech_agent_student_meta"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_interests_uuid_key" ON "tech_agent_student_interests"("uuid");

-- CreateIndex
CREATE INDEX "tech_agent_student_interests_tenant_id_idx" ON "tech_agent_student_interests"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_interests_student_id_idx" ON "tech_agent_student_interests"("student_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_interests_preferred_country_idx" ON "tech_agent_student_interests"("preferred_country");

-- CreateIndex
CREATE INDEX "tech_agent_student_interests_level_of_study_idx" ON "tech_agent_student_interests"("level_of_study");

-- CreateIndex
CREATE INDEX "tech_agent_student_interests_discipline_idx" ON "tech_agent_student_interests"("discipline");

-- CreateIndex
CREATE INDEX "tech_agent_student_interests_created_at_idx" ON "tech_agent_student_interests"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_interests_tenant_id_student_id_key" ON "tech_agent_student_interests"("tenant_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agents_uuid_key" ON "tech_agents"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agents_user_id_key" ON "tech_agents"("user_id");

-- CreateIndex
CREATE INDEX "tech_agents_tenant_id_idx" ON "tech_agents"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_agents_user_id_idx" ON "tech_agents"("user_id");

-- CreateIndex
CREATE INDEX "tech_agents_business_name_idx" ON "tech_agents"("business_name");

-- CreateIndex
CREATE INDEX "tech_agents_country_idx" ON "tech_agents"("country");

-- CreateIndex
CREATE INDEX "tech_agents_is_admin_verified_idx" ON "tech_agents"("is_admin_verified");

-- CreateIndex
CREATE INDEX "tech_agents_created_at_idx" ON "tech_agents"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agents_tenant_id_user_id_key" ON "tech_agents"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_countries_uuid_key" ON "tech_countries"("uuid");

-- CreateIndex
CREATE INDEX "tech_countries_country_idx" ON "tech_countries"("country");

-- CreateIndex
CREATE INDEX "tech_countries_country_slug_idx" ON "tech_countries"("country_slug");

-- CreateIndex
CREATE INDEX "tech_countries_tenant_id_idx" ON "tech_countries"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_countries_tenant_id_country_slug_key" ON "tech_countries"("tenant_id", "country_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_states_uuid_key" ON "tech_states"("uuid");

-- CreateIndex
CREATE INDEX "tech_states_state_idx" ON "tech_states"("state");

-- CreateIndex
CREATE INDEX "tech_states_state_slug_idx" ON "tech_states"("state_slug");

-- CreateIndex
CREATE INDEX "tech_states_country_id_idx" ON "tech_states"("country_id");

-- CreateIndex
CREATE INDEX "tech_states_tenant_id_idx" ON "tech_states"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_states_tenant_id_state_slug_key" ON "tech_states"("tenant_id", "state_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_cities_uuid_key" ON "tech_cities"("uuid");

-- CreateIndex
CREATE INDEX "tech_cities_city_idx" ON "tech_cities"("city");

-- CreateIndex
CREATE INDEX "tech_cities_state_id_idx" ON "tech_cities"("state_id");

-- CreateIndex
CREATE INDEX "tech_cities_tenant_id_idx" ON "tech_cities"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_cities_tenant_id_city_state_id_key" ON "tech_cities"("tenant_id", "city", "state_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_study_levels_uuid_key" ON "tech_study_levels"("uuid");

-- CreateIndex
CREATE INDEX "tech_study_levels_study_level_idx" ON "tech_study_levels"("study_level");

-- CreateIndex
CREATE INDEX "tech_study_levels_studylevel_slug_idx" ON "tech_study_levels"("studylevel_slug");

-- CreateIndex
CREATE INDEX "tech_study_levels_tenant_id_idx" ON "tech_study_levels"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_study_levels_tenant_id_studylevel_slug_key" ON "tech_study_levels"("tenant_id", "studylevel_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_disciplines_uuid_key" ON "tech_disciplines"("uuid");

-- CreateIndex
CREATE INDEX "tech_disciplines_discipline_idx" ON "tech_disciplines"("discipline");

-- CreateIndex
CREATE INDEX "tech_disciplines_discipline_slug_idx" ON "tech_disciplines"("discipline_slug");

-- CreateIndex
CREATE INDEX "tech_disciplines_tenant_id_idx" ON "tech_disciplines"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_disciplines_tenant_id_discipline_slug_key" ON "tech_disciplines"("tenant_id", "discipline_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_partner_types_uuid_key" ON "tech_partner_types"("uuid");

-- CreateIndex
CREATE INDEX "tech_partner_types_kind_of_partners_idx" ON "tech_partner_types"("kind_of_partners");

-- CreateIndex
CREATE INDEX "tech_partner_types_kind_of_partners_slug_idx" ON "tech_partner_types"("kind_of_partners_slug");

-- CreateIndex
CREATE INDEX "tech_partner_types_tenant_id_idx" ON "tech_partner_types"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_partner_types_tenant_id_kind_of_partners_slug_key" ON "tech_partner_types"("tenant_id", "kind_of_partners_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_university_types_uuid_key" ON "tech_university_types"("uuid");

-- CreateIndex
CREATE INDEX "tech_university_types_type_of_university_idx" ON "tech_university_types"("type_of_university");

-- CreateIndex
CREATE INDEX "tech_university_types_type_of_university_slug_idx" ON "tech_university_types"("type_of_university_slug");

-- CreateIndex
CREATE INDEX "tech_university_types_tenant_id_idx" ON "tech_university_types"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_university_types_tenant_id_type_of_university_slug_key" ON "tech_university_types"("tenant_id", "type_of_university_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_intakes_uuid_key" ON "tech_intakes"("uuid");

-- CreateIndex
CREATE INDEX "tech_intakes_intake_idx" ON "tech_intakes"("intake");

-- CreateIndex
CREATE INDEX "tech_intakes_intake_slug_idx" ON "tech_intakes"("intake_slug");

-- CreateIndex
CREATE INDEX "tech_intakes_tenant_id_idx" ON "tech_intakes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_intakes_tenant_id_intake_slug_key" ON "tech_intakes"("tenant_id", "intake_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_universities_uuid_key" ON "tech_universities"("uuid");

-- CreateIndex
CREATE INDEX "tech_universities_university_idx" ON "tech_universities"("university");

-- CreateIndex
CREATE INDEX "tech_universities_university_slug_idx" ON "tech_universities"("university_slug");

-- CreateIndex
CREATE INDEX "tech_universities_country_id_idx" ON "tech_universities"("country_id");

-- CreateIndex
CREATE INDEX "tech_universities_state_id_idx" ON "tech_universities"("state_id");

-- CreateIndex
CREATE INDEX "tech_universities_city_id_idx" ON "tech_universities"("city_id");

-- CreateIndex
CREATE INDEX "tech_universities_kind_of_partners_id_idx" ON "tech_universities"("kind_of_partners_id");

-- CreateIndex
CREATE INDEX "tech_universities_type_of_university_id_idx" ON "tech_universities"("type_of_university_id");

-- CreateIndex
CREATE INDEX "tech_universities_partner_idx" ON "tech_universities"("partner");

-- CreateIndex
CREATE INDEX "tech_universities_created_at_idx" ON "tech_universities"("created_at");

-- CreateIndex
CREATE INDEX "tech_universities_tenant_id_idx" ON "tech_universities"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_universities_tenant_id_university_slug_key" ON "tech_universities"("tenant_id", "university_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_university_courses_uuid_key" ON "tech_university_courses"("uuid");

-- CreateIndex
CREATE INDEX "tech_university_courses_university_id_idx" ON "tech_university_courses"("university_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_course_idx" ON "tech_university_courses"("course");

-- CreateIndex
CREATE INDEX "tech_university_courses_course_slug_idx" ON "tech_university_courses"("course_slug");

-- CreateIndex
CREATE INDEX "tech_university_courses_country_id_idx" ON "tech_university_courses"("country_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_state_id_idx" ON "tech_university_courses"("state_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_city_id_idx" ON "tech_university_courses"("city_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_study_level_id_idx" ON "tech_university_courses"("study_level_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_discipline_id_idx" ON "tech_university_courses"("discipline_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_kind_of_partners_id_idx" ON "tech_university_courses"("kind_of_partners_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_type_of_university_id_idx" ON "tech_university_courses"("type_of_university_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_intake_id_idx" ON "tech_university_courses"("intake_id");

-- CreateIndex
CREATE INDEX "tech_university_courses_is_popular_idx" ON "tech_university_courses"("is_popular");

-- CreateIndex
CREATE INDEX "tech_university_courses_created_at_idx" ON "tech_university_courses"("created_at");

-- CreateIndex
CREATE INDEX "tech_university_courses_tenant_id_idx" ON "tech_university_courses"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_university_courses_tenant_id_course_slug_key" ON "tech_university_courses"("tenant_id", "course_slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_applications_status_uuid_key" ON "tech_applications_status"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_applications_status_status_key" ON "tech_applications_status"("status");

-- CreateIndex
CREATE INDEX "tech_applications_status_status_idx" ON "tech_applications_status"("status");

-- CreateIndex
CREATE INDEX "tech_applications_status_created_at_idx" ON "tech_applications_status"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_applications_uuid_key" ON "tech_student_applications"("uuid");

-- CreateIndex
CREATE INDEX "tech_student_applications_tenant_id_idx" ON "tech_student_applications"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_student_applications_student_id_idx" ON "tech_student_applications"("student_id");

-- CreateIndex
CREATE INDEX "tech_student_applications_course_id_idx" ON "tech_student_applications"("course_id");

-- CreateIndex
CREATE INDEX "tech_student_applications_status_id_idx" ON "tech_student_applications"("status_id");

-- CreateIndex
CREATE INDEX "tech_student_applications_university_slug_idx" ON "tech_student_applications"("university_slug");

-- CreateIndex
CREATE INDEX "tech_student_applications_course_slug_idx" ON "tech_student_applications"("course_slug");

-- CreateIndex
CREATE INDEX "tech_student_applications_application_status_id_idx" ON "tech_student_applications"("application_status_id");

-- CreateIndex
CREATE INDEX "tech_student_applications_fee_status_idx" ON "tech_student_applications"("fee_status");

-- CreateIndex
CREATE INDEX "tech_student_applications_created_at_idx" ON "tech_student_applications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_applications_uuid_key" ON "tech_agent_student_applications"("uuid");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_tenant_id_idx" ON "tech_agent_student_applications"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_agent_student_id_idx" ON "tech_agent_student_applications"("agent_student_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_agent_id_idx" ON "tech_agent_student_applications"("agent_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_course_id_idx" ON "tech_agent_student_applications"("course_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_status_id_idx" ON "tech_agent_student_applications"("status_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_university_slug_idx" ON "tech_agent_student_applications"("university_slug");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_course_slug_idx" ON "tech_agent_student_applications"("course_slug");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_application_status_id_idx" ON "tech_agent_student_applications"("application_status_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_fee_status_idx" ON "tech_agent_student_applications"("fee_status");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_assigned_to_idx" ON "tech_agent_student_applications"("assigned_to");

-- CreateIndex
CREATE INDEX "tech_agent_student_applications_created_at_idx" ON "tech_agent_student_applications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_track_student_app_status_uuid_key" ON "tech_track_student_app_status"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_track_student_app_status_application_id_key" ON "tech_track_student_app_status"("application_id");

-- CreateIndex
CREATE INDEX "tech_track_student_app_status_tenant_id_idx" ON "tech_track_student_app_status"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_track_student_app_status_user_id_idx" ON "tech_track_student_app_status"("user_id");

-- CreateIndex
CREATE INDEX "tech_track_student_app_status_student_id_idx" ON "tech_track_student_app_status"("student_id");

-- CreateIndex
CREATE INDEX "tech_track_student_app_status_application_id_idx" ON "tech_track_student_app_status"("application_id");

-- CreateIndex
CREATE INDEX "tech_track_student_app_status_created_at_idx" ON "tech_track_student_app_status"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_track_student_app_status_tenant_id_application_id_key" ON "tech_track_student_app_status"("tenant_id", "application_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_track_agent_app_status_uuid_key" ON "tech_track_agent_app_status"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tech_track_agent_app_status_application_id_key" ON "tech_track_agent_app_status"("application_id");

-- CreateIndex
CREATE INDEX "tech_track_agent_app_status_tenant_id_idx" ON "tech_track_agent_app_status"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_track_agent_app_status_user_id_idx" ON "tech_track_agent_app_status"("user_id");

-- CreateIndex
CREATE INDEX "tech_track_agent_app_status_agent_student_id_idx" ON "tech_track_agent_app_status"("agent_student_id");

-- CreateIndex
CREATE INDEX "tech_track_agent_app_status_agent_id_idx" ON "tech_track_agent_app_status"("agent_id");

-- CreateIndex
CREATE INDEX "tech_track_agent_app_status_application_id_idx" ON "tech_track_agent_app_status"("application_id");

-- CreateIndex
CREATE INDEX "tech_track_agent_app_status_created_at_idx" ON "tech_track_agent_app_status"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_track_agent_app_status_tenant_id_application_id_key" ON "tech_track_agent_app_status"("tenant_id", "application_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_required_docs_uuid_key" ON "tech_student_required_docs"("uuid");

-- CreateIndex
CREATE INDEX "tech_student_required_docs_tenant_id_idx" ON "tech_student_required_docs"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_student_required_docs_study_level_idx" ON "tech_student_required_docs"("study_level");

-- CreateIndex
CREATE INDEX "tech_student_required_docs_document_key_idx" ON "tech_student_required_docs"("document_key");

-- CreateIndex
CREATE INDEX "tech_student_required_docs_required_idx" ON "tech_student_required_docs"("required");

-- CreateIndex
CREATE INDEX "tech_student_required_docs_created_at_idx" ON "tech_student_required_docs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_required_docs_tenant_id_study_level_document_k_key" ON "tech_student_required_docs"("tenant_id", "study_level", "document_key");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_required_docs_uuid_key" ON "tech_agent_student_required_docs"("uuid");

-- CreateIndex
CREATE INDEX "tech_agent_student_required_docs_tenant_id_idx" ON "tech_agent_student_required_docs"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_required_docs_study_level_idx" ON "tech_agent_student_required_docs"("study_level");

-- CreateIndex
CREATE INDEX "tech_agent_student_required_docs_document_key_idx" ON "tech_agent_student_required_docs"("document_key");

-- CreateIndex
CREATE INDEX "tech_agent_student_required_docs_required_idx" ON "tech_agent_student_required_docs"("required");

-- CreateIndex
CREATE INDEX "tech_agent_student_required_docs_created_at_idx" ON "tech_agent_student_required_docs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_required_docs_tenant_id_study_level_docu_key" ON "tech_agent_student_required_docs"("tenant_id", "study_level", "document_key");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_app_required_docs_uuid_key" ON "tech_student_app_required_docs"("uuid");

-- CreateIndex
CREATE INDEX "tech_student_app_required_docs_tenant_id_idx" ON "tech_student_app_required_docs"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_student_app_required_docs_application_id_idx" ON "tech_student_app_required_docs"("application_id");

-- CreateIndex
CREATE INDEX "tech_student_app_required_docs_document_key_idx" ON "tech_student_app_required_docs"("document_key");

-- CreateIndex
CREATE INDEX "tech_student_app_required_docs_required_idx" ON "tech_student_app_required_docs"("required");

-- CreateIndex
CREATE INDEX "tech_student_app_required_docs_created_at_idx" ON "tech_student_app_required_docs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_app_required_docs_tenant_id_application_id_doc_key" ON "tech_student_app_required_docs"("tenant_id", "application_id", "document_key");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_app_required_docs_uuid_key" ON "tech_agent_student_app_required_docs"("uuid");

-- CreateIndex
CREATE INDEX "tech_agent_student_app_required_docs_tenant_id_idx" ON "tech_agent_student_app_required_docs"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_app_required_docs_application_id_idx" ON "tech_agent_student_app_required_docs"("application_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_app_required_docs_document_key_idx" ON "tech_agent_student_app_required_docs"("document_key");

-- CreateIndex
CREATE INDEX "tech_agent_student_app_required_docs_required_idx" ON "tech_agent_student_app_required_docs"("required");

-- CreateIndex
CREATE INDEX "tech_agent_student_app_required_docs_created_at_idx" ON "tech_agent_student_app_required_docs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_app_required_docs_tenant_id_application__key" ON "tech_agent_student_app_required_docs"("tenant_id", "application_id", "document_key");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_application_docs_uuid_key" ON "tech_student_application_docs"("uuid");

-- CreateIndex
CREATE INDEX "tech_student_application_docs_tenant_id_idx" ON "tech_student_application_docs"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_student_application_docs_application_id_idx" ON "tech_student_application_docs"("application_id");

-- CreateIndex
CREATE INDEX "tech_student_application_docs_user_id_idx" ON "tech_student_application_docs"("user_id");

-- CreateIndex
CREATE INDEX "tech_student_application_docs_document_type_id_idx" ON "tech_student_application_docs"("document_type_id");

-- CreateIndex
CREATE INDEX "tech_student_application_docs_status_idx" ON "tech_student_application_docs"("status");

-- CreateIndex
CREATE INDEX "tech_student_application_docs_verified_by_idx" ON "tech_student_application_docs"("verified_by");

-- CreateIndex
CREATE INDEX "tech_student_application_docs_uploaded_at_idx" ON "tech_student_application_docs"("uploaded_at");

-- CreateIndex
CREATE INDEX "tech_student_application_docs_created_at_idx" ON "tech_student_application_docs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_application_docs_tenant_id_application_id_docu_key" ON "tech_student_application_docs"("tenant_id", "application_id", "document_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_application_docs_uuid_key" ON "tech_agent_student_application_docs"("uuid");

-- CreateIndex
CREATE INDEX "tech_agent_student_application_docs_tenant_id_idx" ON "tech_agent_student_application_docs"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_application_docs_application_id_idx" ON "tech_agent_student_application_docs"("application_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_application_docs_user_id_idx" ON "tech_agent_student_application_docs"("user_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_application_docs_document_type_id_idx" ON "tech_agent_student_application_docs"("document_type_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_application_docs_status_idx" ON "tech_agent_student_application_docs"("status");

-- CreateIndex
CREATE INDEX "tech_agent_student_application_docs_verified_by_idx" ON "tech_agent_student_application_docs"("verified_by");

-- CreateIndex
CREATE INDEX "tech_agent_student_application_docs_uploaded_at_idx" ON "tech_agent_student_application_docs"("uploaded_at");

-- CreateIndex
CREATE INDEX "tech_agent_student_application_docs_created_at_idx" ON "tech_agent_student_application_docs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_application_docs_tenant_id_application_i_key" ON "tech_agent_student_application_docs"("tenant_id", "application_id", "document_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_docs_uuid_key" ON "tech_student_docs"("uuid");

-- CreateIndex
CREATE INDEX "tech_student_docs_tenant_id_idx" ON "tech_student_docs"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_student_docs_user_id_idx" ON "tech_student_docs"("user_id");

-- CreateIndex
CREATE INDEX "tech_student_docs_document_type_id_idx" ON "tech_student_docs"("document_type_id");

-- CreateIndex
CREATE INDEX "tech_student_docs_status_idx" ON "tech_student_docs"("status");

-- CreateIndex
CREATE INDEX "tech_student_docs_verified_by_idx" ON "tech_student_docs"("verified_by");

-- CreateIndex
CREATE INDEX "tech_student_docs_uploaded_at_idx" ON "tech_student_docs"("uploaded_at");

-- CreateIndex
CREATE INDEX "tech_student_docs_created_at_idx" ON "tech_student_docs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_student_docs_tenant_id_user_id_document_type_id_key" ON "tech_student_docs"("tenant_id", "user_id", "document_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_docs_uuid_key" ON "tech_agent_student_docs"("uuid");

-- CreateIndex
CREATE INDEX "tech_agent_student_docs_tenant_id_idx" ON "tech_agent_student_docs"("tenant_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_docs_user_id_idx" ON "tech_agent_student_docs"("user_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_docs_document_type_id_idx" ON "tech_agent_student_docs"("document_type_id");

-- CreateIndex
CREATE INDEX "tech_agent_student_docs_status_idx" ON "tech_agent_student_docs"("status");

-- CreateIndex
CREATE INDEX "tech_agent_student_docs_verified_by_idx" ON "tech_agent_student_docs"("verified_by");

-- CreateIndex
CREATE INDEX "tech_agent_student_docs_uploaded_at_idx" ON "tech_agent_student_docs"("uploaded_at");

-- CreateIndex
CREATE INDEX "tech_agent_student_docs_created_at_idx" ON "tech_agent_student_docs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tech_agent_student_docs_tenant_id_user_id_document_type_id_key" ON "tech_agent_student_docs"("tenant_id", "user_id", "document_type_id");

-- CreateIndex
CREATE INDEX "_PlanFeatures_B_index" ON "_PlanFeatures"("B");

-- AddForeignKey
ALTER TABLE "tech_users" ADD CONSTRAINT "tech_users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tech_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_tenants" ADD CONSTRAINT "tech_tenants_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_tenants" ADD CONSTRAINT "tech_tenants_planId_fkey" FOREIGN KEY ("planId") REFERENCES "tech_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_payments" ADD CONSTRAINT "tech_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tech_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_payments" ADD CONSTRAINT "tech_payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "tech_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_domain_requests" ADD CONSTRAINT "tech_domain_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tech_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_domains" ADD CONSTRAINT "tech_domains_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tech_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_subscription_requests" ADD CONSTRAINT "tech_subscription_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tech_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_subscription_requests" ADD CONSTRAINT "tech_subscription_requests_planId_fkey" FOREIGN KEY ("planId") REFERENCES "tech_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_subscription_requests" ADD CONSTRAINT "tech_subscription_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_subscriptions" ADD CONSTRAINT "tech_subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tech_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_subscriptions" ADD CONSTRAINT "tech_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "tech_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_subscriptions" ADD CONSTRAINT "tech_subscriptions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_newsletter_campaigns" ADD CONSTRAINT "tech_newsletter_campaigns_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_campaign_recipients" ADD CONSTRAINT "tech_campaign_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "tech_newsletter_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_campaign_recipients" ADD CONSTRAINT "tech_campaign_recipients_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "tech_newsletter_subscribers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_pages" ADD CONSTRAINT "tech_pages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_website_sections" ADD CONSTRAINT "tech_website_sections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_website_sections" ADD CONSTRAINT "tech_website_sections_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_feature_elements" ADD CONSTRAINT "tech_feature_elements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "tech_website_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_why_us_elements" ADD CONSTRAINT "tech_why_us_elements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "tech_website_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_explorer_elements" ADD CONSTRAINT "tech_explorer_elements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "tech_website_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_all_feature_elements" ADD CONSTRAINT "tech_all_feature_elements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "tech_website_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_software_elements" ADD CONSTRAINT "tech_software_elements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "tech_website_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_testimonial_elements" ADD CONSTRAINT "tech_testimonial_elements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "tech_website_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_brand_elements" ADD CONSTRAINT "tech_brand_elements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "tech_website_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_activity_logs" ADD CONSTRAINT "tech_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_role_permissions" ADD CONSTRAINT "tech_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tech_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_role_permissions" ADD CONSTRAINT "tech_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "tech_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_tenant_users" ADD CONSTRAINT "tech_tenant_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tech_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_tenant_users" ADD CONSTRAINT "tech_tenant_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_meta" ADD CONSTRAINT "tech_student_meta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_interests" ADD CONSTRAINT "tech_student_interests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tech_student_meta"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_meta" ADD CONSTRAINT "tech_agent_student_meta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_meta" ADD CONSTRAINT "tech_agent_student_meta_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_interests" ADD CONSTRAINT "tech_agent_student_interests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tech_agent_student_meta"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agents" ADD CONSTRAINT "tech_agents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_countries" ADD CONSTRAINT "tech_countries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_states" ADD CONSTRAINT "tech_states_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_states" ADD CONSTRAINT "tech_states_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "tech_countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_cities" ADD CONSTRAINT "tech_cities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_cities" ADD CONSTRAINT "tech_cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "tech_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_study_levels" ADD CONSTRAINT "tech_study_levels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_disciplines" ADD CONSTRAINT "tech_disciplines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_partner_types" ADD CONSTRAINT "tech_partner_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_types" ADD CONSTRAINT "tech_university_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_intakes" ADD CONSTRAINT "tech_intakes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_universities" ADD CONSTRAINT "tech_universities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_universities" ADD CONSTRAINT "tech_universities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "tech_countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_universities" ADD CONSTRAINT "tech_universities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "tech_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_universities" ADD CONSTRAINT "tech_universities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "tech_cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_universities" ADD CONSTRAINT "tech_universities_kind_of_partners_id_fkey" FOREIGN KEY ("kind_of_partners_id") REFERENCES "tech_partner_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_universities" ADD CONSTRAINT "tech_universities_type_of_university_id_fkey" FOREIGN KEY ("type_of_university_id") REFERENCES "tech_university_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tech_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "tech_universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "tech_countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "tech_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "tech_cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_study_level_id_fkey" FOREIGN KEY ("study_level_id") REFERENCES "tech_study_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "tech_disciplines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_kind_of_partners_id_fkey" FOREIGN KEY ("kind_of_partners_id") REFERENCES "tech_partner_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_type_of_university_id_fkey" FOREIGN KEY ("type_of_university_id") REFERENCES "tech_university_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_university_courses" ADD CONSTRAINT "tech_university_courses_intake_id_fkey" FOREIGN KEY ("intake_id") REFERENCES "tech_intakes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_applications" ADD CONSTRAINT "tech_student_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tech_student_meta"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_applications" ADD CONSTRAINT "tech_student_applications_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "tech_university_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_applications" ADD CONSTRAINT "tech_student_applications_application_status_id_fkey" FOREIGN KEY ("application_status_id") REFERENCES "tech_applications_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_applications" ADD CONSTRAINT "tech_student_applications_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_applications" ADD CONSTRAINT "tech_agent_student_applications_agent_student_id_fkey" FOREIGN KEY ("agent_student_id") REFERENCES "tech_agent_student_meta"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_applications" ADD CONSTRAINT "tech_agent_student_applications_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "tech_agents"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_applications" ADD CONSTRAINT "tech_agent_student_applications_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "tech_university_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_applications" ADD CONSTRAINT "tech_agent_student_applications_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "tech_applications_status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_applications" ADD CONSTRAINT "tech_agent_student_applications_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_track_student_app_status" ADD CONSTRAINT "tech_track_student_app_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_track_student_app_status" ADD CONSTRAINT "tech_track_student_app_status_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tech_student_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_track_agent_app_status" ADD CONSTRAINT "tech_track_agent_app_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_track_agent_app_status" ADD CONSTRAINT "tech_track_agent_app_status_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "tech_agents"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_track_agent_app_status" ADD CONSTRAINT "tech_track_agent_app_status_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tech_agent_student_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_app_required_docs" ADD CONSTRAINT "tech_student_app_required_docs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tech_student_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_app_required_docs" ADD CONSTRAINT "tech_agent_student_app_required_docs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tech_agent_student_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_application_docs" ADD CONSTRAINT "tech_student_application_docs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tech_student_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_application_docs" ADD CONSTRAINT "tech_student_application_docs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_application_docs" ADD CONSTRAINT "tech_student_application_docs_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "tech_student_app_required_docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_application_docs" ADD CONSTRAINT "tech_student_application_docs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_application_docs" ADD CONSTRAINT "tech_agent_student_application_docs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tech_agent_student_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_application_docs" ADD CONSTRAINT "tech_agent_student_application_docs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_application_docs" ADD CONSTRAINT "tech_agent_student_application_docs_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "tech_agent_student_app_required_docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_application_docs" ADD CONSTRAINT "tech_agent_student_application_docs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_docs" ADD CONSTRAINT "tech_student_docs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_docs" ADD CONSTRAINT "tech_student_docs_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "tech_student_required_docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_student_docs" ADD CONSTRAINT "tech_student_docs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_docs" ADD CONSTRAINT "tech_agent_student_docs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tech_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_docs" ADD CONSTRAINT "tech_agent_student_docs_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "tech_agent_student_required_docs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_agent_student_docs" ADD CONSTRAINT "tech_agent_student_docs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "tech_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanFeatures" ADD CONSTRAINT "_PlanFeatures_A_fkey" FOREIGN KEY ("A") REFERENCES "tech_plan_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanFeatures" ADD CONSTRAINT "_PlanFeatures_B_fkey" FOREIGN KEY ("B") REFERENCES "tech_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
