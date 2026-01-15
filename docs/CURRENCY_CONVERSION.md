# Conversión de Moneda para Transferencias Mexicanas

## 📋 Resumen

Las transferencias desde México se manejan en **MXN** (pesos mexicanos) en la interfaz de usuario, pero se almacenan en **USD** en la base de datos para mantener consistencia.

## 💱 Tipo de Cambio

**Tipo de cambio fijo**: `1 USD = 20 MXN`

## 🔄 Flujo de Conversión

### 1. **Visualización en el Frontend (México)**

```typescript
// Monto en la base de datos (USD)
gift.total_amount = 100.00 // USD

// Se muestra al usuario mexicano
displayAmount = 100 * 20 = 2,000.00 MXN
```

### 2. **Entrada del Usuario (México)**

```typescript
// Usuario mexicano ingresa: $500.00 MXN

// Se convierte a USD para guardar
amountToSave = 500 / 20 = 25.00 USD
```

### 3. **Validación de Gemini**

```typescript
// El comprobante muestra: $500.00 MXN
// Gemini valida contra: 500 MXN
// Se guarda en DB: 25 USD
```

### 4. **Visualización en Ecuador**

```typescript
// Usuario ecuatoriano ve directamente en USD
displayAmount = 100.00 USD
```

## 📁 Archivos Modificados

### `lib/currency.ts` (Nuevo)

Utilidades de conversión:
- `usdToMxn(usdAmount)` - Convierte USD → MXN
- `mxnToUsd(mxnAmount)` - Convierte MXN → USD  
- `getDisplayAmount(usdAmount, country)` - Obtiene monto en moneda de visualización
- `convertToUsd(amount, country)` - Convierte a USD para guardar en DB

### `components/gifts/TransferModal.tsx`

**Cambios**:
- Muestra montos en MXN para país 'MX'
- Muestra montos en USD para país 'EC'
- Convierte de MXN a USD antes de enviar al servidor
- Etiqueta "Tarjeta" en lugar de "CLABE" para México

**UI actualizada**:
```tsx
// Para México
Monto (MXN) *
Disponible: $2,000.00 MXN (1 USD = 20 MXN)

// Para Ecuador  
Monto (USD) *
Disponible: $100.00
```

### `app/api/gifts/transfer/route.ts`

**Cambios**:
- Recibe `amount` (en USD - ya convertido)
- Recibe `displayAmount` (en moneda original para validación)
- Recibe `displayCurrency` ('USD' o 'MXN')
- Pasa `displayAmount` a Gemini para validar contra el comprobante
- Guarda `amount` en USD en la base de datos

### `app/api/gifts/bank-accounts/route.ts`

**Cambios**:
- Banco actualizado: "Banco Santander México"
- Tipo de cuenta: "Tarjeta" (número de tarjeta en lugar de CLABE)
- Instrucciones actualizadas para depósito a tarjeta

## 🗄️ Estructura de Datos

### Base de Datos (Siempre en USD)

```sql
-- Tabla: gifts
total_amount: 100.00      -- USD
collected_amount: 25.00   -- USD
status: 'AVAILABLE'

-- Tabla: gift_transactions  
amount: 25.00             -- USD (convertido desde 500 MXN)
country: 'MX'
payment_method: 'transfer_mx'
status: 'APPROVED'
```

### Frontend (Depende del País)

```typescript
// México
{
  displayAmount: 2000.00,
  currency: 'MXN',
  formatted: '$2,000.00 MXN'
}

// Ecuador
{
  displayAmount: 100.00,
  currency: 'USD', 
  formatted: '$100.00'
}
```

## ⚙️ Variables de Entorno

```env
# Mexico Account (Tarjeta)
BANK_ACCOUNT_MX_NAME=Daniela Guadalupe Briones Chavez
BANK_ACCOUNT_MX_CARD=5579099012903318
```

## 🧪 Ejemplos de Uso

### Ejemplo 1: Transferencia desde México

```typescript
// 1. Regalo tiene: $100 USD disponibles
const gift = { 
  total_amount: 100, 
  collected_amount: 0 
}

// 2. Usuario mexicano ve: $2,000 MXN disponibles
const display = getDisplayAmount(100, 'MX')
// { amount: 2000, currency: 'MXN', formatted: '$2,000.00 MXN' }

// 3. Usuario ingresa: $500 MXN
const userInput = 500

// 4. Se convierte a USD: $25 USD
const usdAmount = convertToUsd(500, 'MX')
// 25

// 5. Gemini valida comprobante con: $500 MXN
validateReceipt(buffer, 'MX', 500) // displayAmount

// 6. Se guarda en DB: $25 USD
// gift_transactions.amount = 25
// gifts.collected_amount = 25
```

### Ejemplo 2: Transferencia desde Ecuador

```typescript
// 1. Regalo tiene: $100 USD disponibles
const gift = { 
  total_amount: 100, 
  collected_amount: 0 
}

// 2. Usuario ecuatoriano ve: $100 USD disponibles
const display = getDisplayAmount(100, 'EC')
// { amount: 100, currency: 'USD', formatted: '$100.00' }

// 3. Usuario ingresa: $25 USD
const userInput = 25

// 4. Se mantiene en USD: $25 USD
const usdAmount = convertToUsd(25, 'EC')
// 25

// 5. Gemini valida comprobante con: $25 USD
validateReceipt(buffer, 'EC', 25)

// 6. Se guarda en DB: $25 USD
// gift_transactions.amount = 25
// gifts.collected_amount = 25
```

## 🎯 Ventajas de este Enfoque

✅ **Base de datos consistente**: Todo en USD  
✅ **UX localizada**: Usuario ve su moneda local  
✅ **Validación precisa**: Gemini valida contra la moneda del comprobante  
✅ **Fácil de mantener**: Tipo de cambio centralizado en un solo lugar  
✅ **Trigger automático funciona**: El trigger suma USD sin necesidad de conversión

## 🔧 Mantenimiento

### Cambiar el Tipo de Cambio

Si necesitas actualizar el tipo de cambio (actualmente fijo en 20):

```typescript
// lib/currency.ts
export const USD_TO_MXN_RATE = 21; // Nuevo tipo de cambio
```

**Nota**: Esto NO afecta transacciones pasadas, solo nuevas transferencias.

### Agregar Nuevos Países

Si agregas un tercer país con su propia moneda:

1. Actualiza `lib/currency.ts` con la nueva tasa
2. Actualiza `getDisplayAmount()` y `convertToUsd()`
3. Actualiza `TransferModal.tsx` para la nueva moneda
4. Actualiza `bank-accounts/route.ts` con datos bancarios

## ❓ Preguntas Frecuentes

### ¿Por qué no guardar en la moneda original?

Porque complicaría:
- Cálculos de progreso (`collected_amount` / `total_amount`)
- Queries y reportes
- El trigger automático de sincronización

### ¿Qué pasa si el tipo de cambio real cambia?

El tipo de cambio **fijo** de 20 MXN = 1 USD es solo para **simplificar** la contabilidad interna. Los usuarios mexicanos seguirán aportando en MXN según el monto que vean, pero internamente se guarda la equivalencia en USD.

### ¿Gemini valida en la moneda correcta?

Sí. Le pasamos `displayAmount` que está en la moneda del comprobante:
- Comprobante mexicano → valida contra MXN
- Comprobante ecuatoriano → valida contra USD

### ¿Cómo se muestra en el admin panel?

El admin panel debería mostrar:
- Monto en USD (valor en DB)
- País de origen
- Opcionalmente: equivalencia en moneda local

## 🚀 Próximos Pasos

Si necesitas hacer el tipo de cambio dinámico en el futuro:

1. Agregar columna `exchange_rate` a `gift_transactions`
2. Guardar la tasa usada al momento de la transacción  
3. Agregar columna `original_amount` y `original_currency`
4. Actualizar reportes para mostrar ambas monedas
