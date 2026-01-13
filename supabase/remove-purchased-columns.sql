-- Migration: Remove purchased functionality (apartado)
-- Only keep crowdfunding status (COMPLETED when goal is reached)
-- Run this in Supabase SQL Editor

-- Step 1: Drop the index on is_purchased
DROP INDEX IF EXISTS idx_gifts_purchased;

-- Step 2: Drop ALL existing policies that might depend on is_purchased
DROP POLICY IF EXISTS "Gifts can be updated by guests" ON gifts;
DROP POLICY IF EXISTS "Guests can update own purchased gifts" ON gifts;
DROP POLICY IF EXISTS "Update unpurchased gifts only" ON gifts;
DROP POLICY IF EXISTS "Service can update gifts" ON gifts;

-- Step 3: Drop the foreign key constraint
ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_purchased_by_fkey;

-- Step 4: Remove purchased-related columns
ALTER TABLE gifts 
    DROP COLUMN IF EXISTS is_purchased CASCADE,
    DROP COLUMN IF EXISTS purchased_by CASCADE,
    DROP COLUMN IF EXISTS purchased_at CASCADE;

-- Step 5: Recreate simplified policy
-- Only service can update gifts (for crowdfunding status updates)
CREATE POLICY "Service can update gifts"
    ON gifts FOR UPDATE
    USING (true);

-- Step 6: Update the statistics function to remove purchased_gifts
-- First drop the existing function
DROP FUNCTION IF EXISTS get_wedding_stats();

-- Then recreate with new structure
CREATE OR REPLACE FUNCTION get_wedding_stats()
RETURNS TABLE (
    total_guests INT,
    confirmed_guests INT,
    declined_guests INT,
    pending_guests INT,
    total_gifts INT,
    completed_gifts INT,
    total_contributions INT,
    approved_contributions INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(DISTINCT g.id) FROM guests g)::INT as total_guests,
        (SELECT COUNT(DISTINCT g.id) FROM guests g 
         JOIN passes p ON g.id = p.guest_id 
         WHERE p.confirmation_status = 'confirmed')::INT as confirmed_guests,
        (SELECT COUNT(DISTINCT g.id) FROM guests g 
         JOIN passes p ON g.id = p.guest_id 
         WHERE p.confirmation_status = 'declined')::INT as declined_guests,
        (SELECT COUNT(DISTINCT g.id) FROM guests g 
         JOIN passes p ON g.id = p.guest_id 
         WHERE p.confirmation_status = 'pending')::INT as pending_guests,
        (SELECT COUNT(*) FROM gifts)::INT as total_gifts,
        (SELECT COUNT(*) FROM gifts WHERE status = 'COMPLETED')::INT as completed_gifts,
        (SELECT COUNT(*) FROM gift_transactions)::INT as total_contributions,
        (SELECT COUNT(*) FROM gift_transactions WHERE status = 'APPROVED')::INT as approved_contributions;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gifts' 
ORDER BY ordinal_position;

-- Step 8: Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'gifts';

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- Removed columns: is_purchased, purchased_by, purchased_at
-- Updated policies to remove purchased logic
-- Updated statistics function
-- =====================================================
