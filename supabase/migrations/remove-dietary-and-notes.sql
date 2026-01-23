-- Migration: Remove dietary_restrictions and notes columns from passes table
-- Created: 2026-01-22
-- Description: Cleanup migration to remove unused fields from passes table

-- Remove dietary_restrictions column
ALTER TABLE passes DROP COLUMN IF EXISTS dietary_restrictions;

-- Remove notes column
ALTER TABLE passes DROP COLUMN IF EXISTS notes;

-- Verify columns were removed
DO $$
BEGIN
    -- Check if dietary_restrictions column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'passes' 
        AND column_name = 'dietary_restrictions'
    ) THEN
        RAISE EXCEPTION 'Failed to remove dietary_restrictions column';
    END IF;
    
    -- Check if notes column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'passes' 
        AND column_name = 'notes'
    ) THEN
        RAISE EXCEPTION 'Failed to remove notes column';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully. Removed dietary_restrictions and notes columns from passes table.';
END $$;
