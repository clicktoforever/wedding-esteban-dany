# Sincronización de `gifts.collected_amount` con Transacciones

## Problema

La tabla `gifts` tiene las columnas `total_amount` y `collected_amount`, y la vista `gift_progress` calcula el progreso desde las transacciones. Esto causaba **desincronización** entre:
- `gifts.collected_amount` (valor almacenado)
- Suma de transacciones APPROVED (valor real)

## Solución Implementada

Se creó un **trigger automático** que mantiene sincronizado `gifts.collected_amount`:

### Trigger: `trigger_update_gift_collected_amount`

**Archivo**: [`supabase/trigger-update-gift-amount.sql`](../supabase/trigger-update-gift-amount.sql)

**Funcionamiento**:
1. Se activa cuando una transacción cambia a estado `APPROVED`
2. Calcula el total sumando todas las transacciones APPROVED del regalo
3. Actualiza automáticamente:
   - `gifts.collected_amount` = suma de transacciones APPROVED
   - `gifts.status` = 'COMPLETED' si collected_amount >= total_amount

**Ventajas**:
- ✅ Única fuente de verdad: `gift_transactions`
- ✅ Sincronización automática
- ✅ Funciona para PayPhone y transferencias bancarias
- ✅ Transaccional y atómico (usa FOR UPDATE)
- ✅ No requiere código en la aplicación

## Arquitectura

```
┌─────────────────────┐
│ gift_transactions   │
│                     │
│ - status: PENDING   │
│ - status: APPROVED ◄├─── Trigger se activa aquí
│ - status: REJECTED  │
└──────────┬──────────┘
           │
           │ Trigger calcula SUM(amount)
           │ WHERE status = 'APPROVED'
           │
           ▼
┌─────────────────────┐
│ gifts               │
│                     │
│ - collected_amount ◄├─── Actualiza automáticamente
│ - status           ◄├─── AVAILABLE o COMPLETED
│ - total_amount      │
└─────────────────────┘
           │
           │
           ▼
┌─────────────────────┐
│ gift_progress (VIEW)│
│                     │
│ Usa gifts.* y       │
│ COUNT() desde       │
│ gift_transactions   │
└─────────────────────┘
```

## Por qué NO eliminamos `gifts.collected_amount`

Aunque podríamos calcular el `collected_amount` siempre desde transacciones, mantener la columna tiene ventajas:

### 1. **Performance**
```sql
-- Con columna (rápido - index scan)
SELECT name, collected_amount FROM gifts WHERE id = 'xxx';

-- Sin columna (más lento - aggregation scan)
SELECT g.name, COALESCE(SUM(gt.amount), 0) as collected
FROM gifts g
LEFT JOIN gift_transactions gt ON g.id = gt.gift_id AND gt.status = 'APPROVED'
WHERE g.id = 'xxx'
GROUP BY g.name;
```

### 2. **Simplicidad en Queries**
El frontend puede leer directamente `gifts` sin hacer joins complejos.

### 3. **Histórico y Auditoría**
La columna actúa como snapshot del estado actual.

### 4. **Consistencia con `gift_progress`**
La vista usa `gifts.collected_amount`, manteniendo consistencia.

## Código Actualizado

### Backend: `app/api/gifts/transfer/route.ts`

**Antes** (manual):
```typescript
// ❌ Código redundante - actualización manual
if (validationStatus === 'APPROVED') {
  const { data: gift } = await supabase
    .from('gifts')
    .select('collected_amount, total_amount')
    .eq('id', giftId)
    .single();
    
  await supabase
    .from('gifts')
    .update({
      collected_amount: gift.collected_amount + amount,
      status: ...
    })
    .eq('id', giftId);
}

await supabase
  .from('gift_transactions')
  .update({ status: validationStatus })
  .eq('id', transactionId);
```

**Ahora** (automático):
```typescript
// ✅ Solo actualizar la transacción - el trigger hace el resto
await supabase
  .from('gift_transactions')
  .update({ 
    status: validationStatus  // El trigger se activa aquí
  })
  .eq('id', transactionId);
// gifts.collected_amount se actualiza automáticamente
```

## Instalación

1. **Ejecuta el SQL** en Supabase SQL Editor:
   ```bash
   # Copia y pega el contenido de:
   supabase/trigger-update-gift-amount.sql
   ```

2. **Verifica**:
   ```sql
   -- Ver triggers activos
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_gift_collected_amount';
   
   -- Probar
   UPDATE gift_transactions 
   SET status = 'APPROVED' 
   WHERE id = 'test-transaction-id';
   
   -- Verificar que gifts se actualizó
   SELECT id, name, collected_amount, status 
   FROM gifts 
   WHERE id = 'test-gift-id';
   ```

## Testing

```sql
-- 1. Crear un regalo de prueba
INSERT INTO gifts (id, name, total_amount, collected_amount, is_crowdfunding)
VALUES ('test-gift', 'Test Gift', 100.00, 0.00, true);

-- 2. Crear transacciones
INSERT INTO gift_transactions (id, gift_id, donor_name, amount, status)
VALUES 
  ('tx1', 'test-gift', 'Donor 1', 30.00, 'PENDING'),
  ('tx2', 'test-gift', 'Donor 2', 40.00, 'PENDING');

-- 3. Aprobar transacciones
UPDATE gift_transactions SET status = 'APPROVED' WHERE id = 'tx1';
-- gifts.collected_amount = 30.00, status = 'AVAILABLE'

UPDATE gift_transactions SET status = 'APPROVED' WHERE id = 'tx2';
-- gifts.collected_amount = 70.00, status = 'AVAILABLE'

-- 4. Agregar más hasta completar
INSERT INTO gift_transactions (id, gift_id, donor_name, amount, status)
VALUES ('tx3', 'test-gift', 'Donor 3', 30.00, 'APPROVED');
-- gifts.collected_amount = 100.00, status = 'COMPLETED'

-- 5. Verificar
SELECT * FROM gift_progress WHERE id = 'test-gift';
-- Debería mostrar 100% progress_percentage
```

## Preguntas Frecuentes

### ¿Por qué no usar solo la vista `gift_progress`?

Las **vistas** son consultas virtuales que se calculan en tiempo real. Aunque `gift_progress` muestra datos correctos, tener `collected_amount` en `gifts` permite:
- Queries más rápidas en el frontend
- Facilita filtros (`WHERE collected_amount > 50`)
- Permite índices para búsquedas eficientes

### ¿Qué pasa si hay transacciones antiguas sin sincronizar?

Puedes ejecutar un script de migración para recalcular todo:

```sql
-- Recalcular collected_amount para todos los regalos
UPDATE gifts g
SET collected_amount = (
  SELECT COALESCE(SUM(amount), 0)
  FROM gift_transactions
  WHERE gift_id = g.id AND status = 'APPROVED'
),
status = CASE 
  WHEN (SELECT COALESCE(SUM(amount), 0) 
        FROM gift_transactions 
        WHERE gift_id = g.id AND status = 'APPROVED') >= g.total_amount 
  THEN 'COMPLETED'
  ELSE 'AVAILABLE'
END;
```

### ¿El trigger afecta el performance?

No significativamente:
- Se ejecuta solo cuando cambia el `status`
- Usa `FOR UPDATE` para evitar race conditions
- Opera sobre una sola fila de `gifts`
- Es mucho más rápido que recalcular en cada consulta

## Resumen

✅ **Trigger automático** mantiene `gifts.collected_amount` sincronizado  
✅ **Única fuente de verdad**: `gift_transactions` con status APPROVED  
✅ **Performance**: Columna desnormalizada para queries rápidas  
✅ **Consistencia**: `gift_progress` y `gifts` siempre coinciden  
✅ **Universal**: Funciona para PayPhone, transferencias y cualquier método futuro
