CREATE TYPE "public"."unit_status" AS ENUM('VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_name" varchar(100) NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"floor" varchar(20),
	"description" text,
	"status" "unit_status" DEFAULT 'VACANT' NOT NULL,
	"tenant_id" uuid,
	"occupied_at" timestamp,
	"contract_end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;