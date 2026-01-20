-- Remove store_url column from gifts table
-- This field is no longer needed in the application

ALTER TABLE gifts
DROP COLUMN IF EXISTS store_url;

-- Verify the column has been removed
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'gifts';
