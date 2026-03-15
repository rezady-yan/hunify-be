ALTER TABLE "units" DROP CONSTRAINT "units_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "units" DROP COLUMN "tenant_id";