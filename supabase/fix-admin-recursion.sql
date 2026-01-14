-- SCRIPT PARA IMPLEMENTAR RLS SIN RECURSIÓN INFINITA
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can delete admin_users" ON admin_users;

-- 2. Crear función auxiliar con SECURITY DEFINER para evitar recursión
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Si no se proporciona user_id, usar el usuario actual
  target_user_id := COALESCE(check_user_id, auth.uid());
  
  -- Verificar si existe en admin_users
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = target_user_id
  );
END;
$$;

-- 3. Habilitar Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas usando la función auxiliar
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert admin_users" ON admin_users
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update admin_users" ON admin_users
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete admin_users" ON admin_users
  FOR DELETE
  USING (public.is_admin());

-- 5. Verificar que todo funciona
SELECT * FROM admin_users;

-- Listo! Ahora tienes RLS habilitado sin recursión infinita.
