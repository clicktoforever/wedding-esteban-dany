# Migración: Eliminar columnas dietary_restrictions y notes

## 📋 Descripción
Esta migración elimina las columnas `dietary_restrictions` y `notes` de la tabla `passes` ya que estos campos no se utilizan en la aplicación.

## 🚀 Cómo ejecutar la migración

### Opción 1: Usando Supabase CLI (Recomendado)

```bash
# Asegúrate de estar en la raíz del proyecto
cd /Users/carlosmaldonado/Documents/Projects/wedding-esteban-dany

# Ejecutar la migración
supabase db push supabase/migrations/remove-dietary-and-notes.sql
```

### Opción 2: Directamente en Supabase Dashboard

1. Ve a tu proyecto en https://supabase.com
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `supabase/migrations/remove-dietary-and-notes.sql`
5. Ejecuta la query

### Opción 3: Usando psql

```bash
# Conectar a tu base de datos
psql postgresql://[tu-connection-string]

# Ejecutar el script
\i supabase/migrations/remove-dietary-and-notes.sql
```

## ✅ Verificación

Después de ejecutar la migración, verifica que las columnas fueron eliminadas:

```sql
-- Verificar estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'passes';

-- Deberías ver solo:
-- id, guest_id, attendee_name, confirmation_status, updated_at
```

## 📝 Cambios realizados

### Base de datos:
- ✅ Eliminada columna `dietary_restrictions` de tabla `passes`
- ✅ Eliminada columna `notes` de tabla `passes`
- ✅ Actualizado `supabase/schema.sql`

### Código:
- ✅ Eliminadas referencias en todos los componentes TypeScript/React
- ✅ Eliminados campos de interfaces y tipos
- ✅ Actualizadas exportaciones CSV (ambos módulos)
- ✅ Actualizado mock data en `AdminDashboard`
- ✅ Eliminados inputs en `PassCard` component
- ✅ Actualizado script `generate-invites.ts`

### Documentación:
- ✅ Actualizado `docs/FRONTEND_SPECS.md`
- ✅ Eliminadas todas las referencias en documentación

## ⚠️ Notas importantes

- Esta migración es **irreversible** - los datos en estas columnas se perderán permanentemente
- Si tienes datos importantes en estas columnas, haz un backup antes de ejecutar
- La migración incluye verificación automática para confirmar que las columnas fueron eliminadas

## 🔄 Rollback

Si necesitas revertir esta migración (antes de ejecutarla en producción):

```sql
-- Recrear las columnas (SI ES NECESARIO)
ALTER TABLE passes ADD COLUMN dietary_restrictions TEXT;
ALTER TABLE passes ADD COLUMN notes TEXT;
```

**Nota:** Esto solo recreará las columnas vacías, no recuperará datos eliminados.
