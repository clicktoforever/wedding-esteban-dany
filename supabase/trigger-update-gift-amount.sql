-- =====================================================
-- Trigger para actualizar automáticamente gifts.collected_amount
-- cuando una transacción cambia a APPROVED
-- =====================================================

-- Función que actualiza el collected_amount del regalo
CREATE OR REPLACE FUNCTION update_gift_collected_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_collected NUMERIC(10,2);
  v_gift RECORD;
BEGIN
  -- Solo procesar cuando:
  -- 1. Una transacción cambia de otro estado a APPROVED
  -- 2. O cuando se crea una nueva transacción con estado APPROVED
  IF (TG_OP = 'UPDATE' AND OLD.status <> 'APPROVED' AND NEW.status = 'APPROVED')
     OR (TG_OP = 'INSERT' AND NEW.status = 'APPROVED')
  THEN
    -- Obtener información del regalo con bloqueo
    SELECT * INTO v_gift
    FROM gifts
    WHERE id = NEW.gift_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Gift not found: %', NEW.gift_id;
    END IF;
    
    -- Calcular el nuevo monto acumulado sumando todas las transacciones APPROVED
    SELECT COALESCE(SUM(amount), 0) INTO v_new_collected
    FROM gift_transactions
    WHERE gift_id = NEW.gift_id
      AND status = 'APPROVED';
    
    -- Actualizar el regalo
    UPDATE gifts
    SET 
      collected_amount = v_new_collected,
      status = CASE 
        WHEN v_new_collected >= total_amount THEN 'COMPLETED'
        ELSE 'AVAILABLE'
      END,
      is_crowdfunding = true, -- Marcar como crowdfunding si recibe transacciones
      updated_at = NOW()
    WHERE id = NEW.gift_id;
    
    RAISE NOTICE 'Gift % updated: collected_amount = %, status = %', 
      NEW.gift_id, 
      v_new_collected,
      CASE WHEN v_new_collected >= v_gift.total_amount THEN 'COMPLETED' ELSE 'AVAILABLE' END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS trigger_update_gift_collected_amount ON gift_transactions;

-- Crear el trigger en gift_transactions
CREATE TRIGGER trigger_update_gift_collected_amount
  AFTER INSERT OR UPDATE OF status
  ON gift_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_collected_amount();

-- Comentarios de documentación
COMMENT ON FUNCTION update_gift_collected_amount() IS 
'Actualiza automáticamente gifts.collected_amount cuando una transacción es APPROVED. 
Funciona para PayPhone y transferencias bancarias.';

COMMENT ON TRIGGER trigger_update_gift_collected_amount ON gift_transactions IS
'Trigger que mantiene sincronizado gifts.collected_amount con las transacciones aprobadas';

-- =====================================================
-- TEST: Verificar que el trigger funciona
-- =====================================================

-- Puedes probar con:
-- 1. Aprobar una transacción existente:
--    UPDATE gift_transactions SET status = 'APPROVED' WHERE id = 'xxx';
--
-- 2. Verificar el gift:
--    SELECT id, name, total_amount, collected_amount, status FROM gifts WHERE id = 'xxx';
--
-- 3. Ver el log en Supabase (debería aparecer el NOTICE con los valores actualizados)
