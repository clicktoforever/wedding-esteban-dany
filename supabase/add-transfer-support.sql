-- Migración: Agregar soporte de transferencias a gift_transactions
-- Esta migración agrega las columnas necesarias para transferencias bancarias
-- manteniendo compatibilidad con el sistema PayPhone existente

-- 1. Agregar columnas para tipo de pago
ALTER TABLE gift_transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'payphone' 
  CHECK (payment_method IN ('payphone', 'transfer_ec', 'transfer_mx'));

ALTER TABLE gift_transactions
ADD COLUMN IF NOT EXISTS country TEXT 
  CHECK (country IN ('EC', 'MX') OR country IS NULL);

-- 2. Agregar columnas para comprobante de transferencia
ALTER TABLE gift_transactions
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_filename TEXT;

-- 3. Agregar columnas para datos extraídos por Gemini
ALTER TABLE gift_transactions
ADD COLUMN IF NOT EXISTS extracted_recipient_name TEXT,
ADD COLUMN IF NOT EXISTS extracted_account TEXT,
ADD COLUMN IF NOT EXISTS extracted_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS extracted_currency TEXT,
ADD COLUMN IF NOT EXISTS extracted_date DATE,
ADD COLUMN IF NOT EXISTS extracted_reference TEXT,
ADD COLUMN IF NOT EXISTS extracted_bank TEXT;

-- 4. Agregar columnas para validación
ALTER TABLE gift_transactions
ADD COLUMN IF NOT EXISTS validation_confidence TEXT 
  CHECK (validation_confidence IN ('high', 'medium', 'low') OR validation_confidence IS NULL);

ALTER TABLE gift_transactions
ADD COLUMN IF NOT EXISTS validation_errors JSONB DEFAULT '[]'::jsonb;

ALTER TABLE gift_transactions
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- 5. Actualizar ENUM transaction_status para incluir nuevos estados
-- Agregar los nuevos valores al ENUM existente (si no existen)
DO $$ 
BEGIN
  -- Agregar PROCESSING si no existe
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PROCESSING' AND enumtypid = 'transaction_status'::regtype) THEN
    ALTER TYPE transaction_status ADD VALUE 'PROCESSING';
  END IF;
  
  -- Agregar MANUAL_REVIEW si no existe
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MANUAL_REVIEW' AND enumtypid = 'transaction_status'::regtype) THEN
    ALTER TYPE transaction_status ADD VALUE 'MANUAL_REVIEW';
  END IF;
END $$;

-- 6. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_gift_transactions_payment_method 
  ON gift_transactions(payment_method);

CREATE INDEX IF NOT EXISTS idx_gift_transactions_status 
  ON gift_transactions(status);

CREATE INDEX IF NOT EXISTS idx_gift_transactions_country 
  ON gift_transactions(country) WHERE country IS NOT NULL;

-- 7. Comentarios para documentación
COMMENT ON COLUMN gift_transactions.payment_method IS 
  'Método de pago: payphone (tarjeta), transfer_ec (Ecuador), transfer_mx (México)';

COMMENT ON COLUMN gift_transactions.country IS 
  'País de la transferencia: EC (Ecuador), MX (México), NULL para PayPhone';

COMMENT ON COLUMN gift_transactions.validation_confidence IS 
  'Nivel de confianza de Gemini AI: high, medium, low';

COMMENT ON COLUMN gift_transactions.status IS 
  'Estado: PENDING (inicial), PROCESSING (validando), APPROVED (aprobado), REJECTED (rechazado), MANUAL_REVIEW (requiere revisión)';
