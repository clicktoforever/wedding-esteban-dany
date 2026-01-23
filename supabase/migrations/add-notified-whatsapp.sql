-- Migration: Add notified_whatsapp column to guests table
-- Created: 2026-01-22
-- Description: Add boolean column to track if guest has been notified via WhatsApp

-- Add notified_whatsapp column with default false
ALTER TABLE guests ADD COLUMN IF NOT EXISTS notified_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing records to false if they're null
UPDATE guests SET notified_whatsapp = FALSE WHERE notified_whatsapp IS NULL;

-- Verify column was added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'guests' 
        AND column_name = 'notified_whatsapp'
    ) THEN
        RAISE EXCEPTION 'Failed to add notified_whatsapp column';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully. Added notified_whatsapp column to guests table.';
END $$;
