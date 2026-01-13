# Crowdfunding Gift Registry con PayPhone - Configuración

## ✅ Implementación Completa

Se ha implementado exitosamente el sistema de "Crowdfunding Gift Registry" con integración de PayPhone siguiendo la especificación requerida.

---

## 📋 Configuración Requerida

### 1. **Variables de Entorno**

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# PayPhone Configuration
PAYPHONE_TOKEN=tu_token_de_payphone_aqui
PAYPHONE_STORE_ID=tu_store_id_aqui
PAYPHONE_API_URL=https://pay.payphonetodoesposible.com

# App URL (para callbacks)
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

**Dónde obtener las credenciales:**
- Ve a tu panel de PayPhone: https://payphone.app
- Genera tu Token de API
- Obtén tu Store ID
- Para desarrollo local: `NEXT_PUBLIC_APP_URL=http://localhost:3000`

---

### 2. **Ejecutar Migración de Base de Datos**

**Opción A: Desde Supabase Dashboard**
1. Ve a tu proyecto en Supabase
2. SQL Editor → New Query
3. Copia el contenido de `supabase/crowdfunding-schema.sql`
4. Ejecuta el script

**Opción B: Desde tu terminal (si tienes Supabase CLI)**
```bash
supabase db push
```

**Esto creará:**
- Nuevas columnas en la tabla `gifts`: `total_amount`, `collected_amount`, `status`, `is_crowdfunding`
- Nueva tabla `gift_transactions` con sus relaciones
- Función stored procedure `approve_gift_transaction` para transacciones atómicas
- Índices y políticas RLS necesarias

---

### 3. **Actualizar Regalos Existentes**

Después de ejecutar la migración, actualiza tus regalos para habilitar crowdfunding:

```sql
-- Ejemplo: Habilitar crowdfunding para todos los regalos
UPDATE gifts 
SET 
  is_crowdfunding = true,
  total_amount = COALESCE(price, 0),
  collected_amount = 0,
  status = 'AVAILABLE'
WHERE price IS NOT NULL;

-- O para regalos específicos:
UPDATE gifts 
SET 
  is_crowdfunding = true,
  total_amount = 250.00,
  collected_amount = 0,
  status = 'AVAILABLE'
WHERE name = 'Licuadora Premium';
```

---

## 🏗️ Arquitectura Implementada

### **1. Database Schema**
- ✅ Tabla `gifts` actualizada con campos de crowdfunding
- ✅ Nueva tabla `gift_transactions` para transacciones
- ✅ Función `approve_gift_transaction` para aprobar transacciones atómicamente
- ✅ View `gift_progress` para ver el progreso de regalos

### **2. Backend (API Routes)**

**`/api/gifts/contribute` (POST)**
- Valida el monto contra el saldo disponible
- Crea transacción con estado PENDING
- Llama a PayPhone API para preparar pago
- Retorna URL de pago para redirección

**`/api/gifts/confirm-payment` (GET)**
- Recibe callback de PayPhone
- Confirma el estado del pago con PayPhone API
- Llama a stored procedure para aprobar transacción atómicamente
- Actualiza `collected_amount` del regalo
- Marca regalo como COMPLETED si alcanza la meta
- Renderiza página HTML de éxito/error

### **3. Frontend (Components)**

**`ContributionModal`**
- Formulario para donante (nombre, email, monto)
- Validación de monto máximo (no excede el saldo restante)
- Barra de progreso visual
- Botones de montos sugeridos (25%, 50%, 75%, 100%)

**`GiftCard` (Actualizado)**
- Muestra progreso de crowdfunding con barra visual
- Badge "Contribución" para regalos crowdfunding
- Botón "Contribuir" vs "Apartar Regalo"
- Maneja estados: AVAILABLE, COMPLETED

**`GiftRegistry` (Actualizado)**
- Integra ContributionModal
- Estadísticas actualizadas (Disponibles / Completados)
- Manejo dual: regalos tradicionales y crowdfunding

### **4. Utilities (`lib/payphone.ts`)**
- ✅ Tipos TypeScript completos para PayPhone API
- ✅ `preparePayPhonePayment()` - Prepara pago
- ✅ `confirmPayPhonePayment()` - Confirma estado de pago
- ✅ `generateClientTransactionId()` - IDs únicos
- ✅ `formatCurrency()` - Formato de moneda

---

## 🔒 Seguridad Implementada

1. **Transacciones Atómicas (ACID)**
   - Función stored procedure con `FOR UPDATE` locks
   - Previene race conditions en contribuciones simultáneas
   - Valida saldo disponible antes de aprobar

2. **Validación en Múltiples Capas**
   - Frontend: Validación de formulario
   - API: Validación de monto vs saldo restante
   - Database: Constraints y stored procedure

3. **Row Level Security (RLS)**
   - Políticas para lectura pública de gifts
   - Políticas para transacciones controladas

4. **Tokens Seguros**
   - PayPhone token en variables de entorno server-side
   - Nunca expuesto al cliente

---

## 🧪 Testing del Sistema

### **1. Probar Flujo Completo**

```bash
# 1. Inicia el servidor de desarrollo
npm run dev

# 2. Ve a la página de gifts
http://localhost:3000/gifts

# 3. Haz clic en "Contribuir" en un regalo crowdfunding
# 4. Llena el formulario con datos de prueba
# 5. Serás redirigido a PayPhone
# 6. Completa el pago (usa tarjeta de prueba de PayPhone)
# 7. Serás redirigido de vuelta con confirmación
```

### **2. Verificar en Base de Datos**

```sql
-- Ver progreso de regalos
SELECT * FROM gift_progress;

-- Ver transacciones
SELECT 
  gt.donor_name,
  gt.amount,
  gt.status,
  gt.created_at,
  g.name as gift_name
FROM gift_transactions gt
JOIN gifts g ON g.id = gt.gift_id
ORDER BY gt.created_at DESC;

-- Ver regalos completados
SELECT name, collected_amount, total_amount, status
FROM gifts
WHERE is_crowdfunding = true
ORDER BY status DESC, name;
```

---

## 📊 Flujo de Usuario

1. **Usuario ve regalo con crowdfunding**
   - Card muestra barra de progreso
   - Muestra monto recaudado vs meta
   - Badge "Contribución" visible

2. **Usuario hace clic en "Contribuir"**
   - Se abre modal con formulario
   - Ve progreso actual del regalo
   - Ingresa nombre, email (opcional), y monto

3. **Usuario envía formulario**
   - Validación de monto
   - Redirección automática a PayPhone
   - Usuario completa pago en PayPhone

4. **PayPhone procesa pago**
   - Aprobado → Callback a `/api/gifts/confirm-payment`
   - Sistema verifica con PayPhone API
   - Transacción aprobada atómicamente
   - Regalo actualizado

5. **Usuario ve confirmación**
   - Página HTML con detalles del pago
   - Progreso actualizado del regalo
   - Opción de volver a la galería

---

## 🔧 Comandos Útiles

```bash
# Instalar dependencias (si es necesario)
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Verificar tipos TypeScript
npx tsc --noEmit

# Ver logs de Supabase
# (Si usas Supabase local)
supabase status
```

---

## 🚀 Deploy a Producción

### **Vercel (Recomendado para Next.js)**

1. **Configurar Variables de Entorno en Vercel**
   ```bash
   vercel env add PAYPHONE_TOKEN
   vercel env add PAYPHONE_STORE_ID
   vercel env add PAYPHONE_API_URL
   vercel env add NEXT_PUBLIC_APP_URL
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Actualizar URLs de Callback**
   - Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio de producción
   - Ejemplo: `https://wedding-esteban-dany.vercel.app`

---

## 📝 Personalización

### **Cambiar Colores del Progreso**

En `GiftCard.tsx`:
```tsx
// Cambiar el gradiente de la barra de progreso
className="bg-gradient-to-r from-wedding-sage to-wedding-forest h-full"
```

### **Ajustar Montos Sugeridos**

En `ContributionModal.tsx`:
```tsx
// Cambiar porcentajes sugeridos
{[0.25, 0.5, 0.75, 1.0].map((percentage) => { ... })}
// A
{[0.1, 0.25, 0.5, 1.0].map((percentage) => { ... })}
```

### **Personalizar Emails/Notificaciones**

Considera agregar:
- Envío de email de confirmación al donante
- Notificación a los novios cuando se complete un regalo
- Webhook a Slack/Discord para notificaciones en tiempo real

---

## 🐛 Troubleshooting

### **Error: "PAYPHONE_TOKEN is not configured"**
- Asegúrate de tener las variables de entorno configuradas
- Reinicia el servidor de desarrollo

### **Error: "Transaction not found"**
- Verifica que la migración se ejecutó correctamente
- Revisa los logs de Supabase

### **Pago no se confirma**
- Verifica que `NEXT_PUBLIC_APP_URL` sea accesible
- Revisa logs en `/api/gifts/confirm-payment`
- Verifica credenciales de PayPhone

### **Race Condition en Contribuciones**
- La función `approve_gift_transaction` previene esto
- Si ocurre, verifica que la función existe en Supabase

---

## 📚 Recursos

- **PayPhone Docs**: https://www.docs.payphone.app
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✨ Features Implementadas

- ✅ Crowdfunding con contribuciones parciales
- ✅ Validación de monto máximo
- ✅ Transacciones atómicas (ACID)
- ✅ Integración completa con PayPhone
- ✅ UI/UX con barras de progreso
- ✅ Modal de contribución elegante
- ✅ Páginas de confirmación personalizadas
- ✅ Race condition prevention
- ✅ TypeScript tipos completos
- ✅ Seguridad con RLS
- ✅ Manejo de errores robusto

---

## 🎯 Próximos Pasos (Opcional)

1. **Agregar notificaciones por email**
2. **Crear dashboard de admin para ver transacciones**
3. **Implementar webhooks de PayPhone (alternativa a polling)**
4. **Agregar opción de contribución anónima**
5. **Crear reporte de contribuciones en PDF**
6. **Implementar sistema de agradecimiento automático**

---

**¡Sistema completamente funcional y listo para usar! 🎉**
