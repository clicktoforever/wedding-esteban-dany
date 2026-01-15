# Solución al Timeout de Gemini en Vercel

## ❌ Problema Identificado

Según tus logs, la validación **se quedó esperando la respuesta de Gemini** y Vercel cortó la función por timeout:

```
2026-01-15 02:05:36.426 [info] Sending request to Gemini at 2026-01-15T02:05:36.425Z
[... fin de logs, no hay respuesta ...]
```

**Causa:** Vercel Hobby tiene un límite de **10 segundos** por función. Gemini está tardando más que eso.

## ✅ Soluciones Implementadas

### 1. **Timeout Aumentado en vercel.json**

Agregué configuración para 60 segundos:
```json
{
  "functions": {
    "app/api/gifts/transfer/route.ts": {
      "maxDuration": 60
    }
  }
}
```

⚠️ **IMPORTANTE:** Esto requiere **Vercel Pro** ($20/mes). Si tienes Hobby plan, Vercel ignorará esta configuración y seguirá con 10s.

### 2. **Timeout en el Código (45 segundos)**

Agregué un timeout de 45 segundos en la llamada a Gemini para que falle controladamente antes del límite de Vercel:

```typescript
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Gemini API timeout after 45 seconds')), 45000);
});

const result = await Promise.race([geminiPromise, timeoutPromise]);
```

Ahora si Gemini tarda más de 45s, el error se captura y la transacción se marca como `MANUAL_REVIEW` con el mensaje de timeout.

## 🔍 Verificar tu Plan de Vercel

### Opción A: Tienes Vercel Pro
✅ Los cambios funcionarán automáticamente
✅ Deploy y prueba de nuevo

### Opción B: Tienes Vercel Hobby (Free)

Tienes 3 opciones:

#### **1. Upgrade a Vercel Pro** (Recomendado para producción)
- $20/mes
- 60 segundos de timeout
- Más recursos y mejor performance

#### **2. Usar Edge Runtime** (Gratis, más limitado)

Editar `app/api/gifts/transfer/route.ts`:
```typescript
// Agregar al inicio del archivo
export const runtime = 'edge';
export const maxDuration = 25; // Edge permite hasta 25s en Hobby
```

⚠️ **Limitación:** Edge Runtime tiene [restricciones de APIs](https://vercel.com/docs/functions/edge-functions/edge-runtime#compatible-node.js-modules) que pueden causar problemas con el SDK de Gemini.

#### **3. Proceso Completamente Asíncrono** (Más complejo)

Implementar un sistema donde:
1. Usuario sube comprobante → Responde inmediatamente "En proceso"
2. Backend procesa en segundo plano (usando Vercel Cron o servicio externo)
3. Usuario ve estado actualizado cuando refresca

## 🎯 Qué Hacer Ahora

### Paso 1: Verifica tu plan de Vercel

Ve a https://vercel.com/dashboard y mira en la esquina superior derecha:
- Si dice **"Hobby"** → Tienes plan gratuito (10s timeout)
- Si dice **"Pro"** → Tienes plan de pago (60s timeout)

### Paso 2: Según tu plan

**Si tienes PRO:**
- Haz commit y push de los cambios
- Los 60 segundos deberían ser suficientes
- Prueba de nuevo

**Si tienes HOBBY:**
- Opción más rápida: Upgrade a Pro por $20/mes
- Opción alternativa: Intentar Edge Runtime (puede tener incompatibilidades)
- Opción robusta: Implementar proceso async completo (más trabajo)

### Paso 3: Prueba

Después de deployar:
1. Sube un comprobante nuevo
2. Revisa los logs
3. Deberías ver ahora:
   - `[...] Gemini API responded in XXXXms` (si funciona)
   - `[...] Gemini API timeout after 45 seconds` (si sigue siendo lento)

## 🤔 ¿Por qué Gemini está tardando tanto?

Gemini puede tardar entre 3-30 segundos dependiendo de:
- Tamaño de la imagen (41KB es pequeño, no es el problema)
- Carga de servidores de Google
- Complejidad del prompt
- Latencia de red desde Vercel

## 📊 Recomendación

Para una boda con ~100 personas esperando validación de transferencias:

**Mejor opción: Vercel Pro ($20/mes)**
- Timeout suficiente (60s)
- Mejor performance general
- Vale la pena para un evento importante

**Alternativa temporal: Validación manual**
- Revisar transacciones en estado `PROCESSING` manualmente desde admin
- Aprobarlas desde la base de datos

## 🛠️ Validación Manual Temporal

Si quieres aprobar manualmente mientras decides:

```sql
-- En Supabase SQL Editor
UPDATE gift_transactions 
SET status = 'APPROVED',
    validation_result = jsonb_build_object(
      'isValid', true,
      'confidence', 'high',
      'matchesAccount', true,
      'matchesAmount', true,
      'manuallyApproved', true
    )
WHERE id = '6c24e706-f84b-4b4b-9f8e-5ccd2df98419'; -- Tu transaction ID
```

El trigger automáticamente actualizará el `collected_amount` del regalo.

---

**Siguiente paso:** Dime qué plan de Vercel tienes para darte la mejor solución.
