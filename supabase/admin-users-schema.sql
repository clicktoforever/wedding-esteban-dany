-- Tabla para usuarios administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Función auxiliar para verificar si un usuario es admin
-- SECURITY DEFINER permite que se ejecute con privilegios del creador, evitando recursión
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

-- Habilitar Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Los admins pueden ver todos los registros de admin_users
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT
  USING (public.is_admin());

-- Policy: Los admins pueden insertar nuevos admins
CREATE POLICY "Admins can insert admin_users" ON admin_users
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Policy: Los admins pueden actualizar registros
CREATE POLICY "Admins can update admin_users" ON admin_users
  FOR UPDATE
  USING (public.is_admin());

-- Policy: Los admins pueden eliminar registros
CREATE POLICY "Admins can delete admin_users" ON admin_users
  FOR DELETE
  USING (public.is_admin());

-- Índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- NOTA IMPORTANTE:
-- Para crear el primer usuario admin:
-- 1. Crear el usuario en Supabase Auth (desde el dashboard de Supabase)
-- 2. Luego ejecutar el siguiente SQL con el user_id que se generó:
--
-- Primero, deshabilitar RLS temporalmente:
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
--
-- Insertar el primer admin:
-- INSERT INTO admin_users (user_id, email)
-- VALUES ('uuid-del-usuario-creado', 'admin@example.com');
--
-- Re-habilitar RLS:
-- ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
--
-- SEGURIDAD:
-- La función is_admin() usa SECURITY DEFINER para evitar recursión infinita.
-- Las políticas RLS protegen la tabla de acceso no autorizado.
-- La tabla solo debe accederse desde el servidor con la service role key.
