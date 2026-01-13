-- Migration: Add updated_at column to gifts table
-- Run this in Supabase SQL Editor

-- Add updated_at column to gifts table
ALTER TABLE gifts 
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create trigger to auto-update updated_at on gift changes
CREATE TRIGGER update_gifts_updated_at 
    BEFORE UPDATE ON gifts
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'gifts' AND column_name = 'updated_at';
