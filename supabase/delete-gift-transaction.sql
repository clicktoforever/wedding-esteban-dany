-- Run this in Supabase SQL Editor to properly cleanly delete a gift transaction.
-- This function deletes the transaction, removes assigned tokens (if any), and removes the contribution from the collected amount.

CREATE OR REPLACE FUNCTION delete_gift_transaction(p_transaction_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
    v_wallet_tx RECORD;
    v_new_collected NUMERIC(10,2);
    v_gift RECORD;
BEGIN
    SELECT * INTO v_tx 
    FROM public.gift_transactions 
    WHERE id = p_transaction_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction no encontrada.';
    END IF;

    -- Update users balance and remove wallet_transactions
    FOR v_wallet_tx IN 
        SELECT user_email, amount 
        FROM public.wallet_transactions 
        WHERE source_gift_id = p_transaction_id
    LOOP
        UPDATE public.store_users
        SET current_balance = GREATEST(0, current_balance - v_wallet_tx.amount),
            updated_at = NOW()
        WHERE email = v_wallet_tx.user_email;
    END LOOP;

    DELETE FROM public.wallet_transactions
    WHERE source_gift_id = p_transaction_id;

    -- Update gifts collected_amount if necessary
    IF v_tx.status = 'APPROVED' THEN
        SELECT * INTO v_gift
        FROM public.gifts
        WHERE id = v_tx.gift_id
        FOR UPDATE;

        IF FOUND THEN
            v_new_collected := GREATEST(0, COALESCE(v_gift.collected_amount, 0) - v_tx.amount);
            
            UPDATE public.gifts
            SET 
                collected_amount = v_new_collected,
                status = CASE 
                    WHEN v_new_collected >= total_amount THEN 'COMPLETED'
                    ELSE 'AVAILABLE'
                END,
                updated_at = NOW()
            WHERE id = v_tx.gift_id;
        END IF;
    END IF;

    -- Remove the main transaction
    DELETE FROM public.gift_transactions
    WHERE id = p_transaction_id;

END;
$$;
