# Migración: Agregar campo de correo electrónico a transacciones

## Descripción
Esta migración agrega el campo obligatorio `donor_email` a la tabla `gift_transactions` para poder recopilar el correo electrónico de los donantes y enviarles sorpresas.

## Archivos modificados

1. **Base de datos:**
   - `supabase/migrations/20260201_add_donor_email.sql` - Migración SQL

2. **Frontend:**
   - `components/gifts/UnifiedContributionModal.tsx` - Formulario con campo de email

3. **Backend:**
   - `app/api/gifts/contribute/route.ts` - API para pagos con tarjeta
   - `app/api/gifts/transfer/route.ts` - API para transferencias bancarias

4. **Tipos:**
   - `lib/database.types.ts` - Tipos TypeScript actualizados

## Cómo ejecutar la migración

### Opción 1: Desde Supabase Dashboard (Recomendado)
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a SQL Editor
3. Copia el contenido de `supabase/migrations/20260201_add_donor_email.sql`
4. Pégalo en el editor y ejecuta

### Opción 2: Desde línea de comandos
```bash
# Asegúrate de estar autenticado con Supabase CLI
supabase db push --include-all
```

## Script SQL de la migración

```sql
-- Migration: Add donor_email field to gift_transactions table
-- Description: Adds a required email field for gift transaction donors
-- Date: 2026-02-01

ALTER TABLE gift_transactions
ADD COLUMN donor_email TEXT NOT NULL DEFAULT 'pending@email.com';

-- Remove the default after adding the column (for future inserts, email will be required)
ALTER TABLE gift_transactions
ALTER COLUMN donor_email DROP DEFAULT;

-- Add comment to document the column purpose
COMMENT ON COLUMN gift_transactions.donor_email IS 'Email del donante para enviarle sorpresas y comunicaciones';

-- Create index for email lookups
CREATE INDEX idx_gift_transactions_email ON gift_transactions(donor_email);
```

## Cambios en el formulario

El formulario ahora incluye un nuevo campo de correo electrónico:
- **Placeholder:** `dany@gmail.com`
- **Texto explicativo:** "El correo es necesario para poder enviarte una sorpresa"
- **Validación:** Email obligatorio y formato válido
- **Posición:** Entre el campo de nombre y el mensaje

## Validaciones agregadas

- El email es obligatorio en todos los flujos (tarjeta y transferencia)
- Se valida el formato del email con expresión regular
- El botón de submit está deshabilitado si el email está vacío
- Mensajes de error claros para el usuario

## Notas importantes

⚠️ **Datos existentes:** La migración agrega un valor por defecto temporal (`pending@email.com`) a los registros existentes para no romper la base de datos. Luego remueve ese default para que futuros registros requieran el email.

✅ **Compatibilidad:** Todos los nuevos registros requerirán el campo `donor_email`.
