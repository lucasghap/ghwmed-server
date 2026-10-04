-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DOCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('IMAGE_EXAM', 'LAB_EXAM', 'MEDICAL_RECORD_DOCUMENT');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "IntegrationResponseMode" AS ENUM ('OPEN_URL', 'BASE64', 'BUFFER');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "cpf" DROP NOT NULL,
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'DOCTOR',
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "logo_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'custom',
    "status" "IntegrationStatus" NOT NULL DEFAULT 'ACTIVE',
    "url" TEXT NOT NULL,
    "token" TEXT,
    "response" "IntegrationResponseMode",
    "separate_report" BOOLEAN NOT NULL DEFAULT false,
    "report_url" TEXT,
    "report_response" "IntegrationResponseMode",
    "ghapflow_integration" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_type_status_idx" ON "integrations"("type", "status");

-- CreateIndex
CREATE INDEX "admin_audit_logs_actor_id_idx" ON "admin_audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "admin_audit_logs_entity_entity_id_idx" ON "admin_audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
