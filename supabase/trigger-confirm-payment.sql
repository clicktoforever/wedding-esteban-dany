-- =====================================================
-- Script para crear el trigger que confirma pagos con PayPhone
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Paso 1: Habilitar la extensión pg_net (si no está habilitada)
-- Esto permite hacer peticiones HTTP desde PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Paso 2: Crear o reemplazar la función que invoca la Edge Function
CREATE OR REPLACE FUNCTION trigger_confirm_payphone_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url TEXT;
  payload JSONB;
  request_id BIGINT;
  service_role_key TEXT;
BEGIN
  -- Solo procesar si:
  -- 1. La transacción está en estado PENDING
  -- 2. Se acaba de agregar el payphone_transaction_id (cambió de NULL a un valor)
  IF NEW.status = 'PENDING' 
     AND NEW.payphone_transaction_id IS NOT NULL 
     AND (OLD.payphone_transaction_id IS NULL OR OLD.payphone_transaction_id <> NEW.payphone_transaction_id)
  THEN
    -- Construir URL de la Edge Function
    -- IMPORTANTE: Reemplaza 'cleeumrziseyvctsfxxx' con tu referencia de proyecto de Supabase
    edge_function_url := 'https://cleeumrziseyvctsfxxx.supabase.co/functions/v1/confirm-payphone-payment';
    
    -- Service Role Key - REEMPLAZA CON TU SERVICE ROLE KEY REAL
    -- Lo encuentras en: Settings → API → service_role (secret)
    service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsZWV1bXJ6aXNleXZjdHNmeHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk5MTc1NSwiZXhwIjoyMDgzNTY3NzU1fQ.PSjyE_zFhDb_WWo8dfgXUadQg7FTBgVktzTDhsCztLQ';
    
    -- Preparar payload con los datos de la transacción
    payload := jsonb_build_object(
      'record', jsonb_build_object(
        'id', NEW.id,
        'gift_id', NEW.gift_id,
        'donor_name', NEW.donor_name,
        'amount', NEW.amount,
        'status', NEW.status,
        'payphone_transaction_id', NEW.payphone_transaction_id,
        'payphone_client_transaction_id', NEW.payphone_client_transaction_id
      )
    );
    
    -- Invocar la Edge Function de forma asíncrona usando pg_net
    -- Esto no bloquea la transacción actual
    SELECT INTO request_id
      net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := payload
      );
    
    -- Registrar en logs (opcional)
    RAISE LOG 'Triggered PayPhone confirmation for transaction % with request_id %', NEW.id, request_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Paso 3: Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_transaction_payphone_id_update ON gift_transactions;

-- Paso 4: Crear el trigger
-- Se dispara DESPUÉS de cada UPDATE en gift_transactions
CREATE TRIGGER on_transaction_payphone_id_update
  AFTER UPDATE ON gift_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_confirm_payphone_payment();

-- Paso 5: Verificar que el trigger fue creado correctamente
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_transaction_payphone_id_update';

-- =====================================================
-- CONFIGURACIÓN COMPLETADA
-- =====================================================
-- El trigger está listo para procesar transacciones automáticamente
-- cuando se actualice el campo payphone_transaction_id
-- =====================================================
