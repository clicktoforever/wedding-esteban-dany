# 🏦 Sistema de Transferencias Bancarias con Validación IA

## 📋 Descripción General

Sistema completo de pagos por transferencia bancaria con validación automática usando Google Gemini AI. Permite recibir aportes desde Ecuador (Banco Pichincha) y México (BBVA) con verificación instantánea de comprobantes.

## 🎯 Características Principales

- ✅ **Modal de Bienvenida** con localStorage para no repetir
- ✅ **Selección de Método de Pago** (Tarjeta, Transfer EC, Transfer MX)
- ✅ **Validación Automática con IA** (Google Gemini 1.5 Flash)
- ✅ **Soporte Multi-País** (Ecuador USD / México MXN)
- ✅ **Upload de Comprobantes** (hasta 5MB)
- ✅ **OCR Inteligente** (extrae datos del comprobante)
- ✅ **Validación en Tiempo Real** (2-3 segundos)
- ✅ **Review Manual** opcional para casos dudosos
- ✅ **Mobile-First** y totalmente responsive

## 🏗️ Arquitectura

```
┌─────────────────┐
│  Usuario Sube   │
│   Comprobante   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  API Route                  │
│  /api/gifts/transfer        │
│  - Validaciones             │
│  - Upload a Supabase Storage│
│  - Crea registro pendiente  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Gemini API                 │
│  - OCR del comprobante      │
│  - Extrae: destinatario,    │
│    cuenta, monto, fecha     │
│  - Valida contra esperado   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Resultado                  │
│  ✅ Aprobado  → actualiza DB│
│  ⚠️  Review   → notifica    │
│  ❌ Rechazado → notifica    │
└─────────────────────────────┘
```

## 📁 Estructura de Archivos

```
lib/
  └── gemini-receipt-validator.ts     # Servicio principal de validación

app/api/gifts/
  ├── transfer/route.ts                # POST: Procesa transferencia
  └── bank-accounts/route.ts           # GET: Obtiene datos bancarios

components/gifts/
  ├── WelcomeModal.tsx                 # Modal de bienvenida inicial
  ├── PaymentMethodModal.tsx           # Selector de método de pago
  └── TransferModal.tsx                # Form de transferencia + upload

supabase/
  └── add-transfer-support.sql         # Migración para gift_transactions

docs/
  └── BANK_TRANSFER_SETUP.md           # Esta documentación
```

## 🗄️ Base de Datos

### Tabla: `gift_transactions` (Extendida)

La tabla existente `gift_transactions` ha sido extendida para soportar transferencias bancarias, manteniendo compatibilidad total con el sistema PayPhone existente.

**Columnas Nuevas:**

```sql
-- Método de pago
payment_method TEXT DEFAULT 'payphone' 
  CHECK (payment_method IN ('payphone', 'transfer_ec', 'transfer_mx'))

country TEXT CHECK (country IN ('EC', 'MX') OR country IS NULL)

-- Comprobante
receipt_url TEXT
receipt_filename TEXT

-- Datos extraídos por Gemini
extracted_recipient_name TEXT
extracted_account TEXT
extracted_amount DECIMAL(10, 2)
extracted_currency TEXT
extracted_date DATE
extracted_reference TEXT
extracted_bank TEXT

-- Validación
validation_confidence TEXT CHECK (validation_confidence IN ('high', 'medium', 'low'))
validation_errors JSONB DEFAULT '[]'::jsonb
validated_at TIMESTAMPTZ
```

**Estados Actualizados:**

El campo `status` ahora soporta:
- `PENDING` - Recién creado
- `PROCESSING` - En validación con Gemini
- `APPROVED` - ✅ Validado y aprobado
- `REJECTED` - ❌ Rechazado
- `MANUAL_REVIEW` - ⚠️ Requiere revisión manual

## 🔐 Configuración

### 1. Variables de Entorno

```env
# .env.local

# Gemini API (GRATIS)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Obtener API Key de Gemini**:
1. Ve a https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copia y pega en `.env.local`

### 2. Instalar Dependencias

```bash
npm install @google/generative-ai
```

### 3. Crear Tabla en Supabase

```bash
# Ejecutar en Supabase SQL Editor
supabase/add-transfer-support.sql
```

Este script agrega las columnas necesarias a `gift_transactions` sin afectar los datos existentes.

### 4. Configurar Storage Bucket

```sql
-- Crear bucket para comprobantes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-assets', 'wedding-assets', true);

-- Permitir uploads públicos
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'wedding-assets');

-- Permitir lectura pública
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wedding-assets');
```

## 🎨 Datos Bancarios Configurados

### Ecuador (USD)
```typescript
{
  country: 'EC',
  bankName: 'Banco Pichincha',
  accountName: 'Carlos Maldonado',
  accountNumber: 'REDACTED_ACCOUNT',
  accountType: 'Ahorros',
  identificationNumber: 'REDACTED_ID',
  currency: 'USD'
}
```

### México (MXN)
```typescript
{
  country: 'MX',
  bankName: 'BBVA México',
  accountName: 'Daniela Briones',
  accountNumber: 'REDACTED_CLABE', // CLABE
  currency: 'MXN'
}
```

**⚠️ Para cambiar estos datos**, edita:
- `lib/gemini-receipt-validator.ts` (líneas 42-57)

## 🚀 Flujo de Usuario

### 1. Usuario accede a `/gifts`
```
→ Modal de bienvenida (si primera vez)
→ Ve la lista de regalos
```

### 2. Usuario selecciona regalo y clic en "Aportar"
```
→ Modal de selección de método de pago
  - Tarjeta (Payphone)
  - Transferencia Ecuatoriana
  - Transferencia Mexicana
```

### 3. Usuario selecciona "Transferencia Ecuatoriana"
```
→ Modal con:
  - Datos bancarios para copiar
  - Form: nombre, monto, mensaje
  - Upload de comprobante (foto)
→ Click "Enviar para Validación"
```

### 4. Sistema procesa
```
✅ Upload a Supabase Storage
✅ Crea registro en `contributions`
✅ Llama a Gemini API (async)
✅ Respuesta inmediata: "Validando..."
```

### 5. Gemini valida (2-3 segundos)
```
→ Extrae: destinatario, cuenta, monto
→ Compara con datos esperados
→ Si match ✅ → Aprobado
→ Si dudoso ⚠️ → Manual Review
→ Si error ❌ → Rechazado
```

## 🧪 Testing

### Probar Upload
```bash
curl -X POST http://localhost:3000/api/gifts/transfer \
  -F "giftId=xxx" \
  -F "donorName=Juan Pérez" \
  -F "amount=50" \
  -F "country=EC" \
  -F "receipt=@comprobante.jpg"
```

### Consultar Estado
```bash
curl http://localhost:3000/api/gifts/transfer?transactionId=xxx
```

### Datos Bancarios
```bash
curl http://localhost:3000/api/gifts/bank-accounts?country=EC
```

## 📊 Costos

### Gemini API (Tier Gratuito)
- 15 requests/minuto
- 1,500 requests/día
- **Costo para 100 personas: $0** 🎉

### Supabase Storage
- 1GB gratis
- Comprobantes ~500KB cada uno
- **Costo para 100 personas: $0** 🎉

### Total: **GRATIS** ✨

## 🔧 Troubleshooting

### Error: "GEMINI_API_KEY is required"
```bash
# Verificar .env.local
cat .env.local | grep GEMINI

# Reiniciar dev server
npm run dev
```

### Error: "Bucket not found"
```sql
-- Crear bucket en Supabase
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-assets', 'wedding-assets', true);
```

### Error: "No se pudo procesar el comprobante"
- Verificar que la imagen sea legible
- Verificar que el comprobante tenga datos visibles
- Probar con otra imagen de mejor calidad

### Validación siempre va a "manual_review"
- Revisar que los datos bancarios en el código coincidan con los reales
- Verificar que el comprobante tenga los datos esperados
- Ajustar tolerancia en `lib/gemini-receipt-validator.ts` (línea 111)

## 🎯 Mejoras Futuras

- [ ] Notificaciones por email/SMS
- [ ] Dashboard admin para review manual
- [ ] Webhook para actualizar en tiempo real
- [ ] Soporte para más países
- [ ] Historial de contribuciones por usuario
- [ ] Exportar reporte de contribuciones

## 📞 Soporte

Para dudas o problemas:
1. Revisar logs en Vercel/consola
2. Verificar estado en Supabase Dashboard
3. Revisar queries en SQL Editor
4. Verificar usage en Google AI Studio

---

**Creado con ❤️ para Esteban & Dany** 💑
