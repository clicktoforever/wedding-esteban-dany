-- Remove unused columns from gift_transactions table
-- external_transaction_id and payment_url are not used in the application

-- Drop the index first
DROP INDEX IF EXISTS idx_gift_transactions_external_id;

-- Remove the columns
ALTER TABLE gift_transactions DROP COLUMN IF EXISTS external_transaction_id;
ALTER TABLE gift_transactions DROP COLUMN IF EXISTS payment_url;
