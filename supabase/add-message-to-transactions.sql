-- Add message field to gift_transactions table
-- Run this in Supabase SQL Editor

-- Add message column to gift_transactions
ALTER TABLE gift_transactions 
    ADD COLUMN message TEXT;

-- Add comment to document the column
COMMENT ON COLUMN gift_transactions.message IS 'Optional message from the donor to the couple';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gift_transactions' 
  AND column_name = 'message';
