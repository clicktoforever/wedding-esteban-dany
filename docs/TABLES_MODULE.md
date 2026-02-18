# Módulo de Gestión de Mesas - Documentación

## Resumen del Sistema

Se ha implementado un módulo completo de gestión de mesas para la boda siguiendo estrictamente los diseños proporcionados. El sistema permite:

1. **Crear y gestionar mesas** con capacidad configurable (2-12 personas)
2. **Asignar invitados confirmados** a las mesas
3. **Visualizar ocupación** en tiempo real con gráficos circulares
4. **Gestionar capacidad** y eliminar mesas
5. **Filtrado automático** - Solo invitados con pases confirmados pueden ser asignados

## Pasos para Activar el Módulo

### 1. Ejecutar SQL en Supabase

Abre el SQL Editor en tu proyecto de Supabase y ejecuta el contenido del archivo:
```
supabase/tables-schema.sql
```

Este archivo creará:
- Tabla `tables` para almacenar las mesas
- Columna `table_id` en la tabla `guests`
- Índices para optimizar consultas
- Políticas RLS (Row Level Security)
- Triggers para actualizar timestamps

### 2. Acceder al Módulo

El módulo está disponible en:
```
/admin/mesas
```

También está integrado en el BottomNav como el tercer botón con ícono de mesa.

## Estructura de Archivos Creados

### Páginas
- `/app/admin/mesas/page.tsx` - Vista principal con grid de mesas
- `/app/admin/mesas/[id]/page.tsx` - Detalle de mesa con lista de invitados

### Componentes
- `/components/admin/tables/NewTableModal.tsx` - Modal para crear nueva mesa
- `/components/admin/tables/EditTableModal.tsx` - Modal para editar mesa
- `/components/admin/tables/AssignGuestModal.tsx` - Modal para asignar invitados

### SQL
- `/supabase/tables-schema.sql` - Schema completo de base de datos

## Diseño y UX

### Paleta de Colores (Aplicada)
- **Primary**: `#495a51` (Verde Oscuro)
- **Background**: `#fbf8f0` (Crema)
- **Accent**: `#d3c3db` (Lavanda)
- **Secondary**: `#6b7566` (Texto Muted)
- **Malva/Full**: `#996678` (Indica mesa llena)

### Mobile First
- Optimizado para pantallas verticales de móvil
- Bottom Sheet Modals con handle bar
- Transiciones suaves y táctiles
- Grid responsive (2 cols móvil, 3-4 cols desktop)

### Características de Diseño
1. **Vista Grid**: Cards con indicador circular de ocupación
2. **Círculo de progreso**: Visual de capacidad (ej: 8/10)
3. **Estados visuales**: 
   - Disponible (gris)
   - En uso (lavanda)
   - Completa (malva con dot)
4. **Hero visual**: Círculo grande en detalle con patrón sutil
5. **Lista de ocupantes**: Avatares con iniciales, botón X para remover
6. **Búsqueda**: Input con ícono de lupa para filtrar invitados

## Reglas de Negocio Implementadas

### 1. Filtro de Confirmados (CRÍTICO)
Solo aparecen en "disponibles para asignar" los invitados que cumplan:
- `table_id IS NULL` (sin mesa asignada)
- Tienen al menos 1 pase con `confirmation_status = 'confirmed'`

### 2. Validación de Capacidad
- Al crear mesa: capacidad entre 2-12 personas
- Stepper con botones + / - 
- Indicador "Max 12"

### 3. Asignación Múltiple
- Checkboxes para seleccionar varios invitados
- Contador en botón "Asignar X Invitados"
- Asignación en bloque con Promise.all

### 4. Desasignación
- Botón X junto a cada invitado
- Al eliminar mesa, todos los invitados vuelven a "sin asignar"
- Confirmación con DeleteConfirmationModal

## Funcionalidades Implementadas

### Vista Principal (/admin/mesas)
✅ Header con título y contador total
✅ Card de estadísticas (Asignados / Sin Asignar)
✅ Barra de progreso global
✅ Grid de mesas con cards
✅ Círculo de progreso por mesa
✅ Indicador de estado (Disponible/En uso/Completa)
✅ FAB para crear nueva mesa
✅ Loading states con skeleton

### Detalle de Mesa (/admin/mesas/[id])
✅ Header con back button
✅ Hero visual con círculo grande de ocupación
✅ Patrón sutil de fondo (radial gradient)
✅ Animación de rotación decorativa (60s)
✅ Lista de ocupantes con avatares
✅ Botón X para remover invitado
✅ Botones "+ Asignar Silla" para espacios vacíos
✅ Botón "Configurar capacidad"

### Modal Nueva Mesa
✅ Input de nombre con ícono de mesa
✅ Stepper de capacidad (2-12)
✅ Botón guardar con loading state
✅ Validación de campos
✅ Handle bar para drag (mobile)

### Modal Editar Mesa
✅ Precarga de datos actuales
✅ Input editable de nombre
✅ Stepper para cambiar capacidad
✅ Botón "Guardar Cambios"
✅ Botón "Eliminar Mesa" (malva)
✅ Confirmación de eliminación

### Modal Asignar Invitado
✅ Lista solo de invitados confirmados sin mesa
✅ Búsqueda en tiempo real
✅ Checkboxes de selección múltiple
✅ Avatares con iniciales
✅ Badge "Confirmado" con dot verde
✅ Contador "Invitados sin asignar (X)"
✅ Botón "Asignar X Invitados"
✅ Empty states apropiados

## Queries de Supabase

### Cargar Mesas
```typescript
const { data } = await supabase
  .from('tables')
  .select('*')
  .order('created_at', { ascending: true })
```

### Contar Ocupación
```typescript
const { count } = await supabase
  .from('guests')
  .select('*', { count: 'exact', head: true })
  .eq('table_id', tableId)
```

### Invitados Sin Mesa Confirmados
```typescript
// 1. Obtener guests sin mesa
const { data: guests } = await supabase
  .from('guests')
  .select('*')
  .is('table_id', null)

// 2. Filtrar solo los que tienen pases confirmados
for (const guest of guests) {
  const { data: passes } = await supabase
    .from('passes')
    .select('confirmation_status')
    .eq('guest_id', guest.id)
    .eq('confirmation_status', 'confirmed')
    
  if (passes.length > 0) {
    // Este guest tiene pases confirmados
  }
}
```

### Asignar Invitados
```typescript
await supabase
  .from('guests')
  .update({ table_id: tableId })
  .eq('id', guestId)
```

### Remover de Mesa
```typescript
await supabase
  .from('guests')
  .update({ table_id: null })
  .eq('id', guestId)
```

## Testing Manual

1. **Crear mesa**: FAB → Llenar nombre → Ajustar capacidad → Guardar
2. **Ver detalle**: Tap en card de mesa → Ver ocupación visual
3. **Asignar invitados**: "+ Asignar Silla" → Buscar → Seleccionar → Asignar
4. **Verificar filtro**: Solo deben aparecer invitados con `confirmed` en passes
5. **Remover invitado**: X junto al nombre → Confirmar
6. **Editar mesa**: Botón "Configurar capacidad" → Cambiar → Guardar
7. **Eliminar mesa**: Editar → "Eliminar Mesa" → Confirmar
8. **Responsive**: Probar en móvil (2 cols) y desktop (3-4 cols)

## Notas Técnicas

### Performance
- Uso de `Promise.all` para cargar ocupación de múltiples mesas
- Índices en `table_id` para queries rápidas
- Loading states en todas las operaciones async
- Optimistic UI donde es posible

### Accesibilidad
- Botones con áreas táctiles de 44x44px mínimo
- Contraste de colores cumple WCAG AA
- Labels descriptivos en todos los inputs
- Estados de loading claramente indicados

### Mobile UX
- Handle bar visible en modales
- Bottom sheets en móvil, modales centrados en desktop
- Scroll independiente en modales
- Tap targets grandes (size-11 para avatares)
- Active states con scale animations

## Próximas Mejoras Posibles

1. **Drag & Drop**: Arrastrar invitados entre mesas
2. **Vista de plano**: Visualización 2D del salón con mesas posicionadas
3. **Exportar PDF**: Generar lista de mesas para imprimir
4. **Notas por mesa**: Campo de notas (alergias, necesidades especiales)
5. **Historial**: Ver cambios de asignaciones
6. **Capacidad flexible**: Opción de "forzar" asignación sobre capacidad
7. **Etiquetas**: Tags como "Familia", "Amigos", "Trabajo"
8. **Búsqueda avanzada**: Filtros por múltiples criterios

## Contacto de Soporte

Si necesitas ayuda con:
- Modificar diseños
- Agregar funcionalidades
- Debuggear issues
- Optimizar queries

Consulta la documentación de Next.js 16 y Supabase, o revisa los comentarios en el código.
