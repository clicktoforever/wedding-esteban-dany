# Debugging Gemini Validation en Producción

## Problema

Las validaciones de transferencias bancarias fallan en Vercel:
- Transferencias ecuatorianas: Se quedan en estado `PROCESSING`
- Transferencias mexicanas: Estado `MANUAL_REVIEW` con error genérico

## Causas Posibles

### 1. Timeout de Vercel

Las funciones serverless en Vercel tienen límites de tiempo:
- Plan Hobby: 10 segundos
- Plan Pro: 60 segundos

Si la validación de Gemini tarda más, la función se corta.

**Verificación:**
- Revisar logs de Vercel para mensajes de timeout
- Los logs ahora incluyen timestamp y tiempo de respuesta de Gemini

### 3. Límites de Payload

Vercel tiene límite de 4.5MB para el body de requests. Si la imagen es muy grande, puede fallar.

**Verificación:**
- Los logs ahora muestran el tamaño del buffer en bytes
- Recomendación: imágenes < 2MB

### 4. API Key incorrecta o sin permisos

La API key de Gemini puede tener restricciones o estar mal configurada.

**Verificación:**
- Los logs muestran los primeros 10 caracteres de la API key
- Verificar que la key tenga permisos para el modelo especificado

## Cambios Implementados

### 1. Logging Detallado

Ahora cada paso de la validación registra información en la consola:

```typescript
// En validateReceiptAsync (route.ts)
[transaction-id] Starting validation - Country: EC, Expected: 100
[transaction-id] Initializing Gemini validator...
[transaction-id] Validator initialized, calling validateReceipt...
[transaction-id] Gemini response received: {...}

// En GeminiReceiptValidator (gemini-receipt-validator.ts)
[transaction-id] validateReceipt started for EC with expected amount 100
[transaction-id] Converting buffer to base64, size: 245678 bytes
[transaction-id] Target account: Carlos Maldonado 2206900758
[transaction-id] Sending request to Gemini at 2024-01-15T10:30:00.000Z
[transaction-id] Gemini API responded in 3500ms
[transaction-id] Response text length: 450
[transaction-id] Amount validation - Expected: 100, Extracted: 100, Diff: 0, Ok: true
```

### 2. Manejo Mejorado de Errores

Los errores ahora capturan:
- Tipo de error (`error.constructor.name`)
- Mensaje de error (`error.message`)
- Stack trace completo (`error.stack`)
- Objeto completo serializado

Ejemplo en logs:
```
[transaction-id] ===== ERROR IN ASYNC VALIDATION =====
[transaction-id] Error type: GoogleGenerativeAIError
[transaction-id] Error message: Model gemini-3-flash-preview not found
[transaction-id] Error stack: ...
```

### 3. Información en validation_errors

Los errores ahora se guardan con más detalle en la columna `validation_errors`:
```json
[
  "Error al procesar con Gemini AI: Model not found",
  "Stack trace: ..."
]
```

## Pasos para Debuggear en Vercel

### 1. Revisar Logs en Tiempo Real

En Vercel Dashboard:
1. Ir a tu proyecto → Deployments
2. Click en el deployment actual
3. Ir a la pestaña "Functions"
4. Buscar `/api/gifts/transfer`
5. Ver los logs en tiempo real cuando hagas una nueva transferencia

### 3. Hacer una Transferencia de Prueba

1. Subir un comprobante de transferencia
2. Inmediatamente ir a los logs de Vercel
3. Buscar el transaction ID en los logs
4. Seguir la secuencia completa de logs

### 4. Analizar el Error

Buscar en los logs:

**Si dice "API key invalid":**
- Verificar que `GEMINI_API_KEY` esté correcta en Vercel
- Verificar que no tenga restricciones de dominio

**Si dice "Timeout" o no hay respuesta:**
- La imagen puede ser muy grande
- La función de Vercel se está cortando
- Considerar optimizar el tamaño de la imagen antes de subirla

**Si dice "Failed to parse JSON":**
- Gemini no está devolviendo el formato esperado
- Revisar el prompt o el modelo

## Soluciones Rápidas

### Opción 1: Aumentar Timeout (Si tienes Plan Pro)

En `vercel.json`:
```json
{
  "functions": {
    "app/api/gifts/transfer/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Opción 2: Optimizar Imágenes

Agregar compresión en el frontend antes de subir:
```typescript
// En TransferModal.tsx
const compressImage = async (file: File): Promise<File> => {
  // Usar una librería como browser-image-compression
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920
  }
  return await imageCompression(file, options);
}
```

## Testing Local vs Producción

### Local (Funciona)
- Modelo: `gemini-3-flash-preview`
- Timeout: Sin límite
- Red: Sin restricciones corporativas

### Producción Vercel
- Modelo: `gemini-3-flash-preview` (mismo modelo)
- Timeout: 10s (Hobby) / 60s (Pro)
- Red: Infraestructura de Vercel

## Contacto con Soporte

Si después de seguir estos pasos el problema persiste:

1. **Revisar logs de Vercel** y capturar pantalla del error completo
2. **Verificar el estado de Gemini API**: https://status.cloud.google.com/
3. **Verificar límites de la API key**: https://aistudio.google.com/app/apikey
4. **Contactar soporte de Vercel** si es un problema de infraestructura

## Checklist de Verificación

- [ ] Variable `GEMINI_API_KEY` configurada en Vercel
- [ ] Todas las variables de banco configuradas (`BANK_ACCOUNT_*`)
- [ ] Nuevo deployment realizado después de cambiar variables
- [ ] Logs de Vercel revisados para el transaction ID específico
- [ ] Imágenes de prueba < 2MB
- [ ] API key de Gemini tiene cuota disponible (1,500 req/día en free tier)

## Próximos Pasos

Una vez identificado el error específico en los logs:

1. Si es timeout → Optimizar imágenes o upgrade a Pro
2. Si es API key → Regenerar key en Google AI Studio
3. Si es rate limit → Implementar cola o esperar reset (medianoche UTC)

---

**Última actualización:** 2024-01-15
**Logs mejorados en:** route.ts y gemini-receipt-validator.ts
