-- Migration: Add donor_email field to gift_transactions table
-- Description: Adds a required email field for gift transaction donors
-- Date: 2026-02-01

ALTER TABLE gift_transactions
ADD COLUMN donor_email TEXT NOT NULL DEFAULT 'pending@email.com';

-- Remove the default after adding the column (for future inserts, email will be required)
ALTER TABLE gift_transactions
ALTER COLUMN donor_email DROP DEFAULT;

-- Add comment to document the column purpose
COMMENT ON COLUMN gift_transactions.donor_email IS 'Email del donante para enviarle sorpresas y comunicaciones';

-- Create index for email lookups
CREATE INDEX idx_gift_transactions_email ON gift_transactions(donor_email);
