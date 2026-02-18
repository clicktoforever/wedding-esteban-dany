-- Add contributor_count column to gifts table
-- This field tracks the number of unique contributors to each gift

ALTER TABLE gifts
ADD COLUMN IF NOT EXISTS contributor_count INTEGER DEFAULT 0;

-- Update existing gifts with current contributor count
UPDATE gifts
SET contributor_count = (
  SELECT COUNT(DISTINCT donor_name)
  FROM gift_transactions
  WHERE gift_transactions.gift_id = gifts.id
    AND gift_transactions.status = 'APPROVED'
);

-- Create function to update contributor count
CREATE OR REPLACE FUNCTION update_gift_contributor_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update contributor count for the affected gift
  UPDATE gifts
  SET contributor_count = (
    SELECT COUNT(DISTINCT donor_name)
    FROM gift_transactions
    WHERE gift_id = NEW.gift_id
      AND status = 'APPROVED'
  ),
  updated_at = NOW()
  WHERE id = NEW.gift_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update contributor count
DROP TRIGGER IF EXISTS trigger_update_contributor_count ON gift_transactions;
CREATE TRIGGER trigger_update_contributor_count
  AFTER INSERT OR UPDATE OF status ON gift_transactions
  FOR EACH ROW
  WHEN (NEW.status = 'APPROVED')
  EXECUTE FUNCTION update_gift_contributor_count();

-- Verify the column was added and data updated
-- SELECT id, name, contributor_count, collected_amount, total_amount
-- FROM gifts
-- ORDER BY contributor_count DESC;
