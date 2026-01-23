-- Insertar la configuración de fecha de la boda (11 de abril 2026 a las 18:00)
INSERT INTO public.configurations (key, value, description)
VALUES (
  'wedding_date',
  '2026-04-11T18:00:00',
  'Fecha y hora del evento de la boda'
)
ON CONFLICT (key) DO NOTHING;

-- Verificar que se insertó correctamente
SELECT * FROM public.configurations WHERE key = 'wedding_date';
