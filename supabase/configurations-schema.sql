-- Tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS public.configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas por key
CREATE INDEX IF NOT EXISTS idx_configurations_key ON public.configurations(key);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_configurations_updated_at
  BEFORE UPDATE ON public.configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_configurations_updated_at();

-- Insertar la configuración de fecha límite por defecto (10 de marzo 2026)
INSERT INTO public.configurations (key, value, description)
VALUES (
  'confirmation_deadline',
  '2026-03-10T23:59:59',
  'Fecha límite para confirmación de asistencia'
)
ON CONFLICT (key) DO NOTHING;

-- Políticas de seguridad RLS
ALTER TABLE public.configurations ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos (público puede ver la fecha límite)
CREATE POLICY "Anyone can read configurations"
  ON public.configurations
  FOR SELECT
  USING (true);

-- Solo admin_users pueden actualizar configuraciones
CREATE POLICY "Only admins can update configurations"
  ON public.configurations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Solo admin_users pueden insertar configuraciones
CREATE POLICY "Only admins can insert configurations"
  ON public.configurations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.configurations IS 'Almacena configuraciones del sistema como fecha límite de confirmación';
COMMENT ON COLUMN public.configurations.key IS 'Clave única de la configuración';
COMMENT ON COLUMN public.configurations.value IS 'Valor de la configuración (puede ser fecha, texto, JSON, etc)';
COMMENT ON COLUMN public.configurations.description IS 'Descripción de qué hace esta configuración';
