-- Crowdfunding Gift Registry - Schema Updates
-- Run this migration to add crowdfunding functionality

-- ============================================================================
-- 1. ALTER GIFTS TABLE for Crowdfunding
-- ============================================================================

-- Add new columns to gifts table
ALTER TABLE gifts 
    ADD COLUMN total_amount NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN collected_amount NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'COMPLETED')),
    ADD COLUMN is_crowdfunding BOOLEAN DEFAULT FALSE;

-- Update existing gifts to use price as total_amount
UPDATE gifts SET total_amount = price WHERE price IS NOT NULL;

-- Create computed column for completion status
CREATE OR REPLACE FUNCTION is_gift_completed(gift gifts)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN gift.collected_amount >= gift.total_amount AND gift.is_crowdfunding = true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 2. CREATE GIFT_TRANSACTIONS TABLE
-- ============================================================================

CREATE TYPE transaction_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE gift_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
    donor_name TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    external_transaction_id TEXT,
    status transaction_status NOT NULL DEFAULT 'PENDING',
    payphone_client_transaction_id TEXT UNIQUE,
    payphone_transaction_id TEXT,
    payment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    
    -- Ensure amount doesn't exceed remaining balance at creation
    CONSTRAINT valid_amount CHECK (amount > 0)
);

-- ============================================================================
-- 3. INDEXES for Performance
-- ============================================================================

CREATE INDEX idx_gift_transactions_gift ON gift_transactions(gift_id);
CREATE INDEX idx_gift_transactions_status ON gift_transactions(status);
CREATE INDEX idx_gift_transactions_external_id ON gift_transactions(external_transaction_id);
CREATE INDEX idx_gift_transactions_payphone_client_id ON gift_transactions(payphone_client_transaction_id);
CREATE INDEX idx_gifts_crowdfunding ON gifts(is_crowdfunding);
CREATE INDEX idx_gifts_status ON gifts(status);

-- ============================================================================
-- 4. TRIGGERS for auto-update timestamps
-- ============================================================================

CREATE TRIGGER update_gift_transactions_updated_at 
    BEFORE UPDATE ON gift_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. FUNCTION to Update Gift on Transaction Approval (ATOMIC)
-- ============================================================================

CREATE OR REPLACE FUNCTION approve_gift_transaction(transaction_id UUID)
RETURNS JSON AS $$
DECLARE
    v_transaction gift_transactions%ROWTYPE;
    v_gift gifts%ROWTYPE;
    v_new_collected NUMERIC(10,2);
    v_result JSON;
BEGIN
    -- Get transaction with row lock
    SELECT * INTO v_transaction
    FROM gift_transactions
    WHERE id = transaction_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Transaction not found');
    END IF;
    
    -- Check if already approved
    IF v_transaction.status = 'APPROVED' THEN
        RETURN json_build_object('success', false, 'error', 'Transaction already approved');
    END IF;
    
    -- Get gift with row lock
    SELECT * INTO v_gift
    FROM gifts
    WHERE id = v_transaction.gift_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Gift not found');
    END IF;
    
    -- Calculate new collected amount
    v_new_collected := v_gift.collected_amount + v_transaction.amount;
    
    -- Validate amount doesn't exceed total
    IF v_new_collected > v_gift.total_amount THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Amount exceeds remaining balance',
            'remaining', v_gift.total_amount - v_gift.collected_amount
        );
    END IF;
    
    -- Update transaction status
    UPDATE gift_transactions
    SET 
        status = 'APPROVED',
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = transaction_id;
    
    -- Update gift collected amount atomically
    UPDATE gifts
    SET 
        collected_amount = v_new_collected,
        status = CASE 
            WHEN v_new_collected >= total_amount THEN 'COMPLETED'
            ELSE 'AVAILABLE'
        END,
        updated_at = NOW()
    WHERE id = v_transaction.gift_id;
    
    -- Build success response
    v_result := json_build_object(
        'success', true,
        'transaction_id', transaction_id,
        'gift_id', v_transaction.gift_id,
        'new_collected_amount', v_new_collected,
        'total_amount', v_gift.total_amount,
        'is_completed', v_new_collected >= v_gift.total_amount
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on gift_transactions
ALTER TABLE gift_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to gift transactions
CREATE POLICY "Anyone can view gift transactions"
    ON gift_transactions FOR SELECT
    USING (true);

-- Only authenticated service can insert transactions
CREATE POLICY "Service can insert transactions"
    ON gift_transactions FOR INSERT
    WITH CHECK (true);

-- Only service can update transactions
CREATE POLICY "Service can update transactions"
    ON gift_transactions FOR UPDATE
    USING (true);

-- Update gifts RLS to allow public reads
DROP POLICY IF EXISTS "Anyone can view gifts" ON gifts;
CREATE POLICY "Anyone can view gifts"
    ON gifts FOR SELECT
    USING (true);

-- ============================================================================
-- 7. HELPER VIEWS
-- ============================================================================

-- View to see gift progress
CREATE OR REPLACE VIEW gift_progress AS
SELECT 
    g.id,
    g.name,
    g.total_amount,
    g.collected_amount,
    g.status,
    g.is_crowdfunding,
    (g.total_amount - g.collected_amount) as remaining_amount,
    CASE 
        WHEN g.total_amount > 0 THEN 
            ROUND((g.collected_amount / g.total_amount * 100)::numeric, 2)
        ELSE 0
    END as progress_percentage,
    COUNT(gt.id) as total_contributions,
    COUNT(CASE WHEN gt.status = 'APPROVED' THEN 1 END) as approved_contributions
FROM gifts g
LEFT JOIN gift_transactions gt ON g.id = gt.gift_id
WHERE g.is_crowdfunding = true
GROUP BY g.id, g.name, g.total_amount, g.collected_amount, g.status, g.is_crowdfunding;

-- ============================================================================
-- 8. SAMPLE DATA UPDATE (Optional - for existing gifts)
-- ============================================================================

-- Example: Mark some gifts as crowdfunding enabled
-- UPDATE gifts SET is_crowdfunding = true WHERE category = 'Electrodomésticos';

COMMENT ON TABLE gift_transactions IS 'Stores individual contributions/transactions for crowdfunded gifts';
COMMENT ON COLUMN gifts.is_crowdfunding IS 'If true, gift accepts partial contributions via crowdfunding';
COMMENT ON COLUMN gifts.total_amount IS 'Target amount for the gift (goal)';
COMMENT ON COLUMN gifts.collected_amount IS 'Currently collected amount from all approved transactions';
COMMENT ON COLUMN gifts.status IS 'AVAILABLE or COMPLETED based on collected_amount vs total_amount';
COMMENT ON FUNCTION approve_gift_transaction IS 'Atomically approves a transaction and updates gift collected amount';
