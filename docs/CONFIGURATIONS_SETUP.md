# Configuración de Fecha Límite

Este módulo permite configurar la fecha límite de confirmación de asistencia desde el admin dashboard.

## 📋 Instalación

### 1. Ejecutar el Script SQL

Ejecuta el script SQL en Supabase para crear la tabla `configurations`:

**Opción A: Desde Supabase Dashboard**
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia todo el contenido de `supabase/configurations-schema.sql`
4. Pégalo en el editor y presiona **Run**

**Opción B: Desde Terminal (con Supabase CLI)**
```bash
# Asegúrate de estar en la raíz del proyecto
cd /path/to/wedding-esteban-dany

# Ejecuta el script
supabase db execute -f supabase/configurations-schema.sql
```

### 2. Verificar la Tabla

Verifica que la tabla se creó correctamente:

```sql
-- En Supabase SQL Editor
SELECT * FROM public.configurations;
```

Deberías ver una fila con:
- `key`: `'confirmation_deadline'`
- `value`: `'2026-03-10T23:59:59'`
- `description`: `'Fecha límite para confirmación de asistencia'`

## 🎯 Funcionalidad

### En el Admin Dashboard

1. Ve a `/admin`
2. Haz clic en el ícono de **configuración** ⚙️ (esquina superior derecha)
3. Selecciona **"Cambiar Fecha Límite"**
4. Elige la nueva fecha y hora
5. Presiona **"Guardar Fecha"**

La fecha se guardará automáticamente en la base de datos y se mostrará en el sistema.

## 🔒 Seguridad (RLS)

La tabla tiene políticas de seguridad configuradas:

- **Lectura (SELECT)**: Cualquiera puede leer las configuraciones
- **Actualización (UPDATE)**: Solo usuarios en `admin_users` pueden modificar
- **Inserción (INSERT)**: Solo usuarios en `admin_users` pueden agregar configuraciones

## 🛠️ Estructura de la Tabla

```sql
configurations
├── id (UUID, primary key)
├── key (TEXT, unique) - Clave única de la configuración
├── value (TEXT) - Valor almacenado (fecha, JSON, texto, etc)
├── description (TEXT) - Descripción legible
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ) - Se actualiza automáticamente
```

## 📝 Agregar Nuevas Configuraciones

Si necesitas agregar más configuraciones al sistema:

```sql
INSERT INTO public.configurations (key, value, description)
VALUES (
  'nombre_de_configuracion',
  'valor_de_configuracion',
  'Descripción de qué hace'
);
```

Ejemplo:
```sql
INSERT INTO public.configurations (key, value, description)
VALUES (
  'max_guests_per_table',
  '10',
  'Número máximo de invitados por mesa'
);
```

## 🔄 Usar en Otros Componentes

Para leer la fecha límite en otros componentes:

```typescript
import { createClient } from '@/lib/supabase/browser'

async function getDeadline() {
  const supabase = createClient()
  const { data } = await supabase
    .from('configurations')
    .select('value')
    .eq('key', 'confirmation_deadline')
    .single()

  return data?.value ? new Date(data.value) : null
}
```

## ✅ Checklist de Implementación

- [x] Script SQL creado (`configurations-schema.sql`)
- [x] Tipos TypeScript agregados (`database.types.ts`)
- [x] Componente AdminHeader actualizado
- [x] Funcionalidad de carga desde DB
- [x] Funcionalidad de guardado a DB
- [x] UI con spinner de carga
- [x] Políticas RLS configuradas
- [x] Documentación completa

## 🐛 Troubleshooting

### Error: "permission denied for table configurations"

Verifica que el usuario actual esté en la tabla `admin_users`:

```sql
SELECT * FROM admin_users WHERE user_id = auth.uid();
```

Si no aparece, agrégalo:

```sql
INSERT INTO admin_users (user_id, email)
VALUES (auth.uid(), 'tu-email@example.com');
```

### La fecha no se guarda

1. Verifica en la consola del navegador si hay errores
2. Revisa que las políticas RLS estén activas
3. Confirma que el usuario está autenticado
