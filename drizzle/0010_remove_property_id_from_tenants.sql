-- Drop the foreign key constraint and column for property_id from tenants table
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_property_id_properties_id_fk CASCADE;
ALTER TABLE tenants DROP COLUMN IF EXISTS property_id;
