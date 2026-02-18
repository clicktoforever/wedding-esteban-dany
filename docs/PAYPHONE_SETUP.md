# Configuración de PayPhone con Supabase Edge Functions

## Resumen

Esta solución implementa la confirmación de pagos PayPhone de forma asíncrona usando Supabase Edge Functions y Database Triggers.

## Flujo de Confirmación

```
Usuario paga en PayPhone
         ↓
PayPhone redirige a /api/gifts/confirm-payment?id=X&clientTransactionId=Y
         ↓
Endpoint actualiza BD: agrega payphone_transaction_id
         ↓
Trigger PostgreSQL detecta el cambio
         ↓
Trigger invoca Edge Function (asíncrono)
         ↓
Edge Function llama a PayPhone V2/Confirm API
         ↓
Edge Function actualiza estado: CONFIRMED o REJECTED
         ↓
Usuario ya vio mensaje de "Gracias" y fue redirigido
```

# Configuración de PayPhone con Supabase Edge Functions

## Resumen

Esta solución implementa la confirmación de pagos PayPhone de forma asíncrona usando Supabase Edge Functions y Database Triggers. **Todo se puede hacer desde la interfaz web de Supabase**, sin necesidad de CLI.

## Flujo de Confirmación

```
Usuario paga en PayPhone
         ↓
PayPhone redirige a /api/gifts/confirm-payment?id=X&clientTransactionId=Y
         ↓
Endpoint actualiza BD: agrega payphone_transaction_id
         ↓
Trigger PostgreSQL detecta el cambio
         ↓
Trigger invoca Edge Function (asíncrono)
         ↓
Edge Function llama a PayPhone V2/Confirm API
         ↓
Edge Function actualiza estado: CONFIRMED o REJECTED
         ↓
Usuario ya vio mensaje de "Gracias" y fue redirigido
```

## Pasos de Configuración en Supabase (Solo Web - Sin CLI)

### 1. Crear Edge Function desde el Dashboard

1. Ve a **Supabase Dashboard** → https://supabase.com/dashboard
2. Selecciona tu proyecto: `cleeumrziseyvctsfxxx`
3. Ve a **Edge Functions** en el menú lateral
4. Click en **Create a new function**
5. Nombre: `confirm-payphone-payment`
6. Template: Selecciona **Blank function**
7. Copia y pega el contenido de `supabase/functions/confirm-payphone-payment/index.ts`
8. Click en **Deploy**

### 2. Configurar Variables de Entorno (Secrets)

En la misma sección de **Edge Functions**:

1. Click en la pestaña **Settings** o **Secrets**
2. Click en **Add secret**
3. Name: `PAYPHONE_TOKEN`
4. Value: 
```
T9m46OH8aa2d4P5jbsw23-Y4R2eBEpyfpy0j_IF1SXLcFr48WsGcbzOnZWwj6sqbNAVfhdXKsrcnj9CRcCcQQa0fHYRv-o6HD3qMeZv1Eygzu8J3jr1WkUAiQr1sJF_N_haSWwf-vK1vBS2A9Nj5-XrdxLFI93VDax41qDvvyXqXeIpymMiICMXKQ_YdZaOB-6Hdd1AQRWXO3LU4ABJrO4_lNtCzUOK8AvEF0E6E8gjSo9vUkpmjLsfwEbgbuJg_BLYR6DfPD4anXh3T2C1HzN-YATrwN-QFk8nuPOf9nnZEWuQIXzJJ7kjo7Di_L0_a9hro9Q
```
5. Click en **Save**

### 3. Configurar Database Trigger

1. Ve a **SQL Editor** en el menú lateral
2. Click en **New query**
3. Copia el contenido de `supabase/trigger-confirm-payment.sql`
4. **IMPORTANTE:** Reemplaza `YOUR_PROJECT_REF` con `cleeumrziseyvctsfxxx`
5. Click en **Run** o presiona `Ctrl+Enter`

### 4. Configurar Service Role Key en PostgreSQL

En **SQL Editor**, crea una nueva query y ejecuta:

```sql
-- Reemplaza el valor con tu Service Role Key
-- Lo encuentras en: Settings → API → service_role (secret)
ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsZWV1bXJ6aXNleXZjdHNmeHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk5MTc1NSwiZXhwIjoyMDgzNTY3NzU1fQ.PSjyE_zFhDb_WWo8dfgXUadQg7FTBgVktzTDhsCztLQ';
```

**Importante:** Después de ejecutar, cierra y vuelve a abrir SQL Editor.

### 5. Verificar la Configuración

En **SQL Editor**, ejecuta:

```sql
-- Verificar que el trigger existe
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_transaction_payphone_id_update';

-- Verificar que la configuración está guardada
SELECT current_setting('app.settings.service_role_key', true) IS NOT NULL as configured;

-- Verificar que pg_net está habilitado
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

Si pg_net no está instalado, ejecuta:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 6. Ver Logs de Edge Function

1. Ve a **Edge Functions** → `confirm-payphone-payment`
2. Click en la pestaña **Logs**
3. Aquí verás todas las invocaciones y sus resultados en tiempo real

### 7. Probar la Edge Function Manualmente (Opcional)

En **Edge Functions**, click en **Invoke function**:

Payload de prueba:
```json
{
  "record": {
    "id": "test-id",
    "status": "PENDING",
    "payphone_transaction_id": "75415469",
    "payphone_client_transaction_id": "GIFT-TEST-123"
  }
}
```

## Plan Free Tier de Supabase

✅ **Esta solución está dentro del Free Tier:**

- **Edge Functions:** 500,000 invocaciones/mes (más que suficiente)
- **Database Triggers:** Sin límite
- **pg_net requests:** 2.5M requests/mes
- **Function execution time:** 100 CPU-hours/mes

Para una boda con ~200 invitados y ~300 transacciones, usarás menos del 0.1% del límite gratuito.

## Troubleshooting

### Error: "function net.http_post does not exist"

Ejecuta en SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Edge Function no se dispara

1. Verifica los logs:
   ```bash
   supabase functions logs confirm-payphone-payment
   ```

2. Verifica que el trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_transaction_payphone_id_update';
   ```

3. Verifica pg_net logs:
   ```sql
   SELECT * FROM net._http_response ORDER BY created DESC LIMIT 10;
   ```

### PayPhone sigue devolviendo 500

Esto es un problema conocido. La Edge Function debería funcionar porque:
- No tiene limitaciones de NODE_TLS_REJECT_UNAUTHORIZED
- Deno (runtime de Edge Functions) maneja TLS correctamente
- Puede agregar headers adicionales si es necesario

Si persiste, contacta soporte de PayPhone con estos logs.

## Monitoreo

### Ver transacciones pendientes:

```sql
SELECT 
  id,
  donor_name,
  amount,
  status,
  payphone_transaction_id,
  created_at
FROM gift_transactions
WHERE status = 'PENDING'
ORDER BY created_at DESC;
```

### Ver últimas confirmaciones:

```sql
SELECT 
  id,
  donor_name,
  amount,
  status,
  payphone_status,
  updated_at
FROM gift_transactions
WHERE status IN ('CONFIRMED', 'REJECTED')
ORDER BY updated_at DESC
LIMIT 20;
```

## Estructura de Archivos

```
wedding-esteban-dany/
├── supabase/
│   ├── functions/
│   │   └── confirm-payphone-payment/
│   │       └── index.ts              # Edge Function
│   └── trigger-confirm-payment.sql    # Database Trigger
├── app/
│   ├── api/
│   │   └── gifts/
│   │       └── confirm-payment/
│   │           └── route.ts           # Callback de PayPhone
│   └── confirm-payment/
│       └── page.tsx                   # Página de agradecimiento
└── docs/
    └── PAYPHONE_SETUP.md              # Este archivo
```

## Comandos Útiles (Si tienes CLI instalado - Opcional)

```bash
# Desplegar cambios a Edge Function
supabase functions deploy confirm-payphone-payment

# Ver logs en tiempo real
supabase functions logs confirm-payphone-payment --tail

# Probar localmente (requiere Deno)
supabase functions serve confirm-payphone-payment

# Eliminar Edge Function
supabase functions delete confirm-payphone-payment
```

## Instalación de CLI (Alternativa - No requerida)

Si prefieres usar CLI en lugar de la web, usa **Scoop** en Windows:

```bash
# Instalar Scoop (si no lo tienes)
iwr -useb get.scoop.sh | iex

# Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

O usa **NPX** sin instalación global:
```bash
npx supabase@latest --version
npx supabase@latest login
npx supabase@latest functions deploy confirm-payphone-payment
```
