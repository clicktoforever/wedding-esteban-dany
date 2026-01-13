# Resumen de Cambios - Eliminación de Funcionalidad "Apartado"

## 📋 Descripción
Se eliminó completamente la funcionalidad de "apartado" de regalos, dejando únicamente el sistema de crowdfunding con estado "COMPLETADO" cuando se alcanza la meta.

## 🗄️ Cambios en Base de Datos

### Script SQL creado: `supabase/remove-purchased-columns.sql`

**Columnas eliminadas de la tabla `gifts`:**
- ✅ `is_purchased` (boolean)
- ✅ `purchased_by` (UUID reference)
- ✅ `purchased_at` (timestamp)

**Índices eliminados:**
- ✅ `idx_gifts_purchased`

**Constraints eliminados:**
- ✅ `gifts_purchased_by_fkey` (foreign key)

**Políticas RLS actualizadas:**
- ✅ Eliminadas políticas relacionadas con `purchased`
- ✅ Creada nueva política simplificada "Service can update gifts"

**Funciones actualizadas:**
- ✅ `get_wedding_stats()` - Ahora usa `completed_gifts` en lugar de `purchased_gifts`

## 🎨 Cambios en Frontend

### 1. Tipos TypeScript (`lib/database.types.ts`)
- ✅ Eliminadas propiedades `is_purchased`, `purchased_by`, `purchased_at`
- ✅ Agregada propiedad `updated_at`
- ✅ Eliminada relación `gifts_purchased_by_fkey`

### 2. Componente `GiftCard.tsx`
**Antes:**
- Botón "Apartar" para regalos tradicionales
- Estados: Disponible / Apartado / Completado

**Después:**
- Solo botón "Aportar" (flujo PayPhone)
- Estados: Disponible / Completado
- Eliminada lógica de `isPurchased`
- Badge de "✓ Completado" solo cuando `status === 'COMPLETED'`

### 3. Componente `GiftRegistry.tsx`
**Eliminado:**
- ✅ Función `purchaseGift()`
- ✅ Estados `isPending`, `message`
- ✅ Prop `disabled` en GiftCard
- ✅ Prop `onPurchase` en GiftCard
- ✅ Mensajes de éxito/error de apartado

**Actualizado:**
- ✅ Contador "Disponibles": `filter(g => g.status !== 'COMPLETED')`
- ✅ Contador "Completados": `filter(g => g.status === 'COMPLETED')`

### 4. Componente `AdminDashboard.tsx`
**Actualizado:**
- ✅ Tabla "Regalos Disponibles": usa `status !== 'COMPLETED'`
- ✅ Tabla "Regalos Completados": usa `status === 'COMPLETED'`
- ✅ Agregado import `formatCurrency`
- ✅ Muestra monto total y recaudado en completados
- ✅ Eliminadas referencias a `purchased_at`

## 📝 Instrucciones de Migración

### Paso 1: Ejecutar script SQL
```sql
-- Ir a Supabase Dashboard → SQL Editor
-- Copiar y ejecutar: supabase/remove-purchased-columns.sql
```

### Paso 2: Verificar cambios
```sql
-- Ver estructura actualizada de gifts
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gifts' 
ORDER BY ordinal_position;

-- Ver políticas actualizadas
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'gifts';
```

### Paso 3: Deploy código actualizado
```bash
npm run build
# Deploy a tu plataforma (Vercel/otro)
```

## ✨ Nuevas Características

### Solo Crowdfunding
- **Todos los regalos** ahora funcionan como crowdfunding
- Los usuarios aportan cualquier monto hasta completar la meta
- Estado `COMPLETED` se actualiza automáticamente cuando `collected_amount >= total_amount`

### Flujo Unificado
- Un solo botón "Aportar" para todos los regalos
- Modal de contribución con PayPhone
- Confirmación automática vía Edge Function
- Sin bloqueo de regalos (sin apartados)

## 🎯 Beneficios

1. **Simplicidad**: Un solo flujo de pago para todo
2. **Flexibilidad**: Múltiples personas pueden contribuir al mismo regalo
3. **Transparencia**: Progreso visible en tiempo real
4. **Seguridad**: Confirmación automática de pagos
5. **Mejor UX**: Sin frustración por regalos "ya apartados"

## 🔧 Archivos Modificados

- ✅ `supabase/remove-purchased-columns.sql` (NUEVO)
- ✅ `lib/database.types.ts`
- ✅ `components/gifts/GiftCard.tsx`
- ✅ `components/gifts/GiftRegistry.tsx`
- ✅ `components/admin/AdminDashboard.tsx`

## ⚠️ Notas Importantes

- El script SQL es **irreversible** - hace DROP de columnas
- Backup recomendado antes de ejecutar
- Los datos de regalos existentes se mantienen, solo se pierden datos de "apartado"
- La columna `updated_at` debe existir (migración previa)

## 🧪 Testing Checklist

- [ ] Ejecutar script SQL sin errores
- [ ] Verificar página `/gifts` carga correctamente
- [ ] Hacer contribución de prueba con PayPhone
- [ ] Verificar actualización automática de progreso
- [ ] Verificar estado COMPLETED cuando se alcanza meta
- [ ] Revisar panel admin muestra contadores correctos
- [ ] Build de producción sin errores
