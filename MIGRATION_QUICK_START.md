# Guía Rápida: Ejecutar Migración de Email

## Paso 1: Ejecutar la migración SQL

Copia y pega este SQL en Supabase SQL Editor:

```sql
-- Migration: Add donor_email field to gift_transactions table
ALTER TABLE gift_transactions
ADD COLUMN donor_email TEXT NOT NULL DEFAULT 'pending@email.com';

ALTER TABLE gift_transactions
ALTER COLUMN donor_email DROP DEFAULT;

COMMENT ON COLUMN gift_transactions.donor_email IS 'Email del donante para enviarle sorpresas y comunicaciones';

CREATE INDEX idx_gift_transactions_email ON gift_transactions(donor_email);
```

## Paso 2: Verificar que funciona

1. Reinicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la app y ve a la sección de regalos

3. Intenta hacer una contribución - deberías ver el nuevo campo de email

## ¿Qué cambió?

✅ Tabla `gift_transactions` ahora tiene columna `donor_email` (obligatorio)
✅ Formulario de contribución ahora pide email con ejemplo "dany@gmail.com"
✅ Texto explicativo: "El correo es necesario para poder enviarte una sorpresa"
✅ Validación de formato de email
✅ APIs actualizadas para requerir y guardar el email

## Solución de problemas

Si ves errores:
- Asegúrate de haber ejecutado el SQL en Supabase
- Reinicia el servidor con `npm run dev`
- Revisa la consola del navegador para ver errores específicos
