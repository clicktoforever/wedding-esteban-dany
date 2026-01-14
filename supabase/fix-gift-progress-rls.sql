-- Fix RLS for gift_progress view
-- Run this in Supabase SQL Editor

-- NOTA: Las vistas heredan RLS de sus tablas base (gifts y gift_transactions)
-- No podemos habilitar RLS directamente en una vista como si fuera una tabla

-- Opción 1: Usar security_invoker para que la vista use los permisos del usuario actual
ALTER VIEW gift_progress SET (security_invoker = true);

-- Opción 2: Recrear la vista con security_invoker desde el inicio
DROP VIEW IF EXISTS gift_progress;

CREATE VIEW gift_progress 
WITH (security_invoker = true)
AS
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

-- Verificar que las tablas base tengan RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('gifts', 'gift_transactions')
ORDER BY tablename;

-- Ver las políticas en las tablas base
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('gifts', 'gift_transactions')
ORDER BY tablename, policyname;
