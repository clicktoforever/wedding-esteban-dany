# 📐 Especificaciones Frontend - Wedding Platform

## 🎯 Objetivo
Documentación completa de todas las pantallas, datos y estructura para rediseño con IA especializada en UI/Frontend.

---

## 📊 Base de Datos - Estructura de Datos

### Tabla: `guests`
```typescript
{
  id: string                    // UUID
  name: string                  // Nombre del invitado principal
  email: string | null          // Email opcional
  phone: string | null          // Teléfono opcional
  access_token: string          // Token único para acceso (ej: "test_token_carlos_123")
  created_at: string           // ISO timestamp
  updated_at: string           // ISO timestamp
}
```

### Tabla: `passes`
```typescript
{
  id: string                    // UUID
  guest_id: string              // FK a guests.id
  attendee_name: string         // Nombre del acompañante
  confirmation_status: 'pending' | 'confirmed' | 'declined'
  dietary_restrictions: string | null  // Ej: "Vegetariano", "Sin gluten"
  notes: string | null          // Notas adicionales
  updated_at: string           // ISO timestamp
}
```

### Tabla: `gifts`
```typescript
{
  id: string                    // UUID
  name: string                  // Nombre del regalo
  description: string | null    // Descripción detallada
  image_url: string | null      // URL de imagen (puede ser null)
  price: number | null          // Precio en MXN
  store_url: string | null      // Link a tienda externa
  category: string | null       // Ej: "Cocina", "Hogar", "Experiencias"
  is_purchased: boolean         // true = ya apartado
  purchased_by: string | null   // FK a guests.id (quien lo apartó)
  purchased_at: string | null   // ISO timestamp
  created_at: string           // ISO timestamp
}
```

### Función RPC: `get_wedding_stats`
Retorna:
```typescript
{
  total_guests: number          // Total de invitados
  total_passes: number          // Total de pases
  confirmed_passes: number      // Pases confirmados
  declined_passes: number       // Pases declinados
  pending_passes: number        // Pases pendientes
  total_gifts: number          // Total de regalos
  purchased_gifts: number      // Regalos apartados
}
```

---

## 🎨 Pantallas y Especificaciones

### 1. 🏠 Landing Page - `/`

**Tipo:** Server-Side Generation + ISR (revalida cada 60s)

**Propósito:** Página de bienvenida editable con información de la boda

**Datos Necesarios:**
- NINGUNO (contenido estático o de Builder.io)

**Estructura Visual Actual:**
```
┌─────────────────────────────────────────┐
│           HERO SECTION                  │
│    "Esteban & Dany"                     │
│    "¡Nos casamos!"                      │
│    "15 de Junio, 2026"                  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         COUNTDOWN TIMER                 │
│    "Faltan X días X horas..."           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      INFO DE LA BODA (Grid 2 cols)     │
│  📍 Lugar          🕐 Hora              │
│  Por confirmar     6:00 PM              │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│             CTA BUTTON                  │
│    "¿Nos acompañas?"                    │
│    Link a WhatsApp o página confirm     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│        GALERÍA DE FOTOS                 │
│    "Nuestra Historia"                   │
│    (Grid de imágenes - placeholder)     │
└─────────────────────────────────────────┘
```

**Componentes Usados:**
- `WeddingCountdown` - Cuenta regresiva hasta fecha objetivo
- `GalleryGrid` - Grid responsive de imágenes
- `ConfirmationCTA` - Call-to-action con botón destacado

**Colores Theme:**
```css
primary-50: #fdf2f8   /* Fondo rosa claro */
primary-600: #db2777  /* Rosa fuerte para títulos */
pink-50: #fdf2f8      /* Rosa muy claro */
gray-600: #4b5563     /* Texto secundario */
```

**Fuentes:**
- Títulos: `Playfair Display` (serif, elegante)
- Texto: `Inter` (sans-serif, moderna)

**Mejoras Sugeridas para UI:**
- [ ] Animaciones sutiles en scroll (parallax suave)
- [ ] Transiciones elegantes entre secciones
- [ ] Hero con imagen de fondo (pareja)
- [ ] Countdown con animación de números
- [ ] Botones con hover states sofisticados
- [ ] Glassmorphism en cards de info
- [ ] Galería con lightbox modal

---

### 2. ✅ Confirmación - `/confirm/[token]`

**Tipo:** Server-Side Rendering

**Propósito:** Página para que invitados confirmen/declinen asistencia

**Datos Necesarios:**
```typescript
// Fetch desde Supabase
const guest = await supabase
  .from('guests')
  .select('*, passes(*)')
  .eq('access_token', token)
  .single()

// Estructura del dato:
{
  id: "uuid",
  name: "Carlos Malo",           // Mostrar en saludo
  email: "carlos@example.com",
  phone: "+52...",
  access_token: "test_token_carlos_123",
  passes: [                       // Array de acompañantes
    {
      id: "uuid",
      guest_id: "uuid",
      attendee_name: "Carlos Malo",
      confirmation_status: "pending",
      dietary_restrictions: null,
      notes: null
    },
    {
      id: "uuid",
      guest_id: "uuid",
      attendee_name: "Acompañante de Carlos",
      confirmation_status: "pending",
      dietary_restrictions: null,
      notes: null
    }
  ]
}
```

**Estructura Visual Actual:**
```
┌─────────────────────────────────────────┐
│              HEADER                     │
│    "Confirmación de Asistencia"         │
│    "¡Hola, {guest.name}!"               │
│    "Por favor confirma la asistencia    │
│     de tus invitados"                   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│           LISTA DE PASSES               │
│  ┌───────────────────────────────────┐  │
│  │ PASS CARD 1                       │  │
│  │ Nombre: {attendee_name}           │  │
│  │ Status: [Pending badge]           │  │
│  │ ┌─────────┐  ┌──────────┐        │  │
│  │ │Confirmar│  │ Declinar │        │  │
│  │ └─────────┘  └──────────┘        │  │
│  │ [Input] Restricciones dietéticas  │  │
│  │ [Textarea] Notas adicionales      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ PASS CARD 2                       │  │
│  │ ...                               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Componente Principal:**
- `GuestConfirmation` (Client Component)
- `PassCard` (Client Component)

**Estados y Interactividad:**
1. **Estado Inicial:** Todos los passes en "pending"
2. **Acción Confirmar:**
   - Cambiar badge a "confirmed" (verde)
   - Habilitar inputs de restricciones/notas
   - Guardar en Supabase con `useTransition`
3. **Acción Declinar:**
   - Cambiar badge a "declined" (rojo)
   - Deshabilitar inputs
   - Guardar en Supabase
4. **Feedback:**
   - Loading states durante guardado
   - Mensajes de éxito/error
   - Deshabilitar botones durante mutación

**API Endpoints:**
```typescript
// UPDATE pass
await supabase
  .from('passes')
  .update({
    confirmation_status: 'confirmed' | 'declined',
    dietary_restrictions: string,
    notes: string,
    updated_at: new Date().toISOString()
  })
  .eq('id', passId)
  .eq('guest_id', guestId)  // RLS security
```

**Mejoras Sugeridas para UI:**
- [ ] Cards con sombras sutiles y bordes redondeados
- [ ] Animación smooth al cambiar de estado
- [ ] Confetti animation al confirmar todos los passes
- [ ] Progress bar (X de Y confirmados)
- [ ] Toast notifications para feedback
- [ ] Validación visual de campos (checkmarks)
- [ ] Botones con estados disabled más claros
- [ ] Mobile-first: cards apiladas verticalmente

---

### 3. 🎁 Mesa de Regalos - `/gifts`

**Tipo:** Server-Side Rendering + ISR (revalida cada 10s)

**Propósito:** Catálogo de regalos con sistema de apartado en tiempo real

**Datos Necesarios:**
```typescript
// Fetch inicial desde Server Component
const gifts = await supabase
  .from('gifts')
  .select('*')
  .order('category', { ascending: true })
  .order('name', { ascending: true })

// Estructura del array:
[
  {
    id: "uuid",
    name: "Juego de Sartenes",
    description: "Set de 3 sartenes antiadherentes...",
    image_url: "https://...",      // Puede ser null
    price: 1299.99,
    store_url: "https://amazon.mx/...",
    category: "Cocina",
    is_purchased: false,            // KEY: disponibilidad
    purchased_by: null,             // Si comprado: UUID del guest
    purchased_at: null,
    created_at: "2026-01-08T..."
  },
  // ... más regalos
]
```

**Estructura Visual Actual:**
```
┌─────────────────────────────────────────┐
│              HEADER                     │
│    "Mesa de Regalos"                    │
│    "Tu presencia es nuestro mejor       │
│     regalo, pero si deseas..."          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│          FILTROS POR CATEGORÍA          │
│  [Todos] [Cocina] [Hogar] [Viaje]...   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│        GRID DE GIFT CARDS (3 cols)     │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ IMG  │  │ IMG  │  │ IMG  │          │
│  │Name  │  │Name  │  │Name  │          │
│  │$1299 │  │$899  │  │APART │          │
│  │[Ver] │  │[Ver] │  │ ADO  │          │
│  └──────┘  └──────┘  └──────┘          │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ ...  │  │ ...  │  │ ...  │          │
│  └──────┘  └──────┘  └──────┘          │
└─────────────────────────────────────────┘
```

**Componentes:**
- `GiftRegistry` (Client Component) - Contenedor con filtros
- `GiftCard` (Client Component) - Card individual de regalo

**Estados y Interactividad:**
1. **Filtros de Categoría:**
   - Botones toggle para cada categoría
   - "Todos" muestra todo
   - Filtrado en cliente con `useState`

2. **Gift Card States:**
   - **Disponible:**
     - Imagen + Nombre + Precio
     - Botón "Ver Detalles"
     - Badge "Disponible" (verde)
   - **Apartado:**
     - Overlay semi-transparente
     - Badge "Apartado" (gris)
     - Sin botón de acción
   - **Hover (si disponible):**
     - Zoom suave de imagen
     - Sombra más pronunciada

3. **Modal de Detalle:**
   - Imagen grande
   - Descripción completa
   - Precio destacado
   - Botón "Apartar Regalo"
   - Link a tienda externa (si existe)

4. **Acción Apartar:**
   - Solicitar nombre del invitado
   - Confirmar acción (modal)
   - Guardar en Supabase
   - Actualizar UI optimistically
   - Refrescar lista (revalidate)

**API Endpoints:**
```typescript
// PURCHASE gift
await supabase
  .from('gifts')
  .update({
    is_purchased: true,
    purchased_by: guestId,      // Si hay guest autenticado
    purchased_at: new Date().toISOString()
  })
  .eq('id', giftId)
  .eq('is_purchased', false)    // Prevent race conditions
```

**Mejoras Sugeridas para UI:**
- [ ] Cards con aspect ratio 4:3 consistente
- [ ] Skeleton loaders mientras carga
- [ ] Animación de "flip" al apartar
- [ ] Filtros con animación slide
- [ ] Imagen placeholder si no hay image_url
- [ ] Badge de "Nuevo" para regalos recientes
- [ ] Sorting: precio, nombre, categoría
- [ ] Search bar para buscar regalos
- [ ] Lazy loading de imágenes
- [ ] Grid responsive (4-3-2-1 cols)
- [ ] Toast "¡Regalo apartado con éxito!"

---

### 4. 📊 Admin Dashboard - `/admin`

**Tipo:** Server-Side Rendering + ISR (revalida cada 10s)

**Propósito:** Dashboard administrativo con métricas en tiempo real

**Datos Necesarios:**
```typescript
// 1. Stats agregadas
const stats = await supabase.rpc('get_wedding_stats')
// Retorna:
{
  total_guests: 3,
  total_passes: 6,
  confirmed_passes: 2,
  declined_passes: 1,
  pending_passes: 3,
  total_gifts: 6,
  purchased_gifts: 1
}

// 2. Lista completa de guests con passes
const guests = await supabase
  .from('guests')
  .select('*, passes(*)')
  .order('name', { ascending: true })
// Retorna array de guests con passes nested

// 3. Lista de gifts
const gifts = await supabase
  .from('gifts')
  .select('*')
  .order('is_purchased', { ascending: false })
// Retorna array ordenado (apartados primero)
```

**Estructura Visual Actual:**
```
┌─────────────────────────────────────────────────────────┐
│                     HEADER                              │
│    "Dashboard Administrativo"                           │
│    "Vista en tiempo real de confirmaciones y regalos"   │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                STATS CARDS (Grid 4 cols)                │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐           │
│  │👥 3   │  │🎟️ 6  │  │✅ 2   │  │❌ 1   │           │
│  │Guests │  │Passes │  │Confir │  │Declin │           │
│  └───────┘  └───────┘  └───────┘  └───────┘           │
│  ┌───────┐  ┌───────┐                                  │
│  │⏳ 3   │  │🎁 1/6 │                                  │
│  │Pendin │  │Gifts  │                                  │
│  └───────┘  └───────┘                                  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│              TABLA DE GUESTS                            │
│  ┌──────────┬─────────┬──────────┬─────────┐           │
│  │ Nombre   │ Passes  │ Confirm  │ Pending │           │
│  ├──────────┼─────────┼──────────┼─────────┤           │
│  │ Carlos   │ 2       │ 1        │ 1       │           │
│  │ Ana      │ 2       │ 0        │ 2       │           │
│  │ Luis     │ 2       │ 1        │ 0       │           │
│  └──────────┴─────────┴──────────┴─────────┘           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│              TABLA DE GIFTS                             │
│  ┌──────────┬─────────┬──────────┬─────────┐           │
│  │ Regalo   │ Precio  │ Status   │ Por     │           │
│  ├──────────┼─────────┼──────────┼─────────┤           │
│  │ Sartenes │ $1,299  │ APARTADO │ Carlos  │           │
│  │ Toallas  │ $599    │ Disponib │ -       │           │
│  └──────────┴─────────┴──────────┴─────────┘           │
└─────────────────────────────────────────────────────────┘
```

**Componente Principal:**
- `AdminDashboard` (Client Component)

**Visualización de Datos:**
1. **Stats Cards:**
   - Iconos representativos
   - Números grandes
   - Colores por tipo (verde confirmado, rojo declinado, amarillo pendiente)
   - Progress bars para porcentajes

2. **Tabla de Guests:**
   - Nombre del guest (link a página de confirmación?)
   - Total de passes
   - Passes confirmados
   - Passes pendientes
   - Passes declinados
   - Email/teléfono en tooltip

3. **Tabla de Gifts:**
   - Nombre del regalo
   - Precio formateado
   - Status (badge colorido)
   - Comprado por (nombre del guest)
   - Fecha de compra

**Mejoras Sugeridas para UI:**
- [ ] Gráficas visuales:
  - Pie chart de confirmación status
  - Bar chart de regalos por categoría
  - Timeline de confirmaciones
- [ ] Export data a CSV/Excel
- [ ] Filtros y búsqueda en tablas
- [ ] Sorting por columnas
- [ ] Paginación si hay muchos datos
- [ ] Real-time updates (Supabase Realtime)
- [ ] Indicador de "última actualización"
- [ ] Cards con animación de counter
- [ ] Dark mode para admin
- [ ] Print-friendly view

---

## 🎨 Design System

### Paleta de Colores
```css
/* Primary (Rosa) */
--primary-50: #fdf2f8
--primary-100: #fce7f3
--primary-200: #fbcfe8
--primary-300: #f9a8d4
--primary-400: #f472b6
--primary-500: #ec4899
--primary-600: #db2777
--primary-700: #be185d
--primary-800: #9f1239
--primary-900: #831843

/* Grays */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827

/* Status Colors */
--success: #10b981  /* Verde para confirmado */
--warning: #f59e0b  /* Amarillo para pendiente */
--error: #ef4444    /* Rojo para declinado */
```

### Tipografía
```css
/* Headings */
h1, h2, h3 {
  font-family: 'Playfair Display', serif;
  color: var(--primary-600);
}

/* Body */
body, p, span {
  font-family: 'Inter', sans-serif;
  color: var(--gray-700);
}

/* Font Sizes (Tailwind) */
text-xs: 0.75rem    /* 12px */
text-sm: 0.875rem   /* 14px */
text-base: 1rem     /* 16px */
text-lg: 1.125rem   /* 18px */
text-xl: 1.25rem    /* 20px */
text-2xl: 1.5rem    /* 24px */
text-3xl: 1.875rem  /* 30px */
text-4xl: 2.25rem   /* 36px */
text-5xl: 3rem      /* 48px */
```

### Espaciado
```css
/* Padding/Margin (Tailwind scale) */
p-2: 0.5rem   /* 8px */
p-4: 1rem     /* 16px */
p-6: 1.5rem   /* 24px */
p-8: 2rem     /* 32px */
p-12: 3rem    /* 48px */
```

### Componentes Comunes

#### Button
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-600);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--primary-700);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--primary-600);
  border: 2px solid var(--primary-600);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}
```

#### Card
```css
.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}
.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}
```

#### Badge
```css
.badge-pending {
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.badge-declined {
  background: #fee2e2;
  color: #991b1b;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Tablet */
md: 768px   /* Desktop small */
lg: 1024px  /* Desktop medium */
xl: 1280px  /* Desktop large */
2xl: 1536px /* Desktop XL */
```

**Grid Responsivo:**
```html
<!-- Gift Cards Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <!-- Cards aquí -->
</div>

<!-- Stats Grid -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <!-- Stats aquí -->
</div>
```

---

## 🔄 Estados de Carga

### Skeleton Loaders
Para gifts, guests, y stats durante fetch:
```html
<div class="animate-pulse">
  <div class="h-48 bg-gray-200 rounded-lg mb-4"></div>
  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### Loading States
```html
<!-- Button Loading -->
<button disabled class="opacity-50 cursor-not-allowed">
  <svg class="animate-spin h-5 w-5 mr-3" />
  Guardando...
</button>
```

---

## 🚀 Animaciones Recomendadas

### Framer Motion (o similar)
```javascript
// Fade in up
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

// Scale in
const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3 }
}

// Stagger children
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}
```

---

## 📦 Assets Necesarios

### Imágenes
- [ ] Hero background (pareja) - 1920x1080px
- [ ] Gallery photos (6-10 fotos) - 800x600px
- [ ] Gift placeholder image - 400x300px
- [ ] Favicon/Logo - 512x512px
- [ ] OG image para social sharing - 1200x630px

### Iconos
- [ ] Iconos para categorías de regalos
- [ ] Iconos para stats dashboard
- [ ] Iconos de estado (check, x, clock)

---

## 🔌 APIs y Endpoints

### Supabase Client (Browser)
```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Ejemplo: Update pass
const { data, error } = await supabase
  .from('passes')
  .update({ confirmation_status: 'confirmed' })
  .eq('id', passId)
  .select()
```

### Server Actions Pattern (Opcional)
```typescript
// app/actions.ts
'use server'

export async function updatePassStatus(passId: string, status: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('passes')
    .update({ confirmation_status: status })
    .eq('id', passId)
    .select()
    
  return { data, error }
}
```

---

## 🎯 Prioridades de Mejora

### Alta Prioridad (Must Have)
1. ✅ Mobile responsive perfecto (80% tráfico mobile)
2. ✅ Loading states en todas las acciones
3. ✅ Validación de formularios con feedback visual
4. ✅ Toast notifications para feedback
5. ✅ Animaciones suaves entre estados

### Media Prioridad (Nice to Have)
1. 🟡 Confetti al confirmar asistencia
2. 🟡 Modal de detalle en gift cards
3. 🟡 Progress bar en confirmación
4. 🟡 Gráficas en admin dashboard
5. 🟡 Dark mode (opcional)

### Baja Prioridad (Future)
1. 🔵 Realtime updates (Supabase Realtime)
2. 🔵 Export data a CSV
3. 🔵 Multi-idioma (i18n)
4. 🔵 PWA capabilities
5. 🔵 Email notifications

---

## 📚 Librerías Recomendadas

### UI Components
```bash
npm install @headlessui/react @heroicons/react
# O alternativamente
npm install shadcn-ui
```

### Animaciones
```bash
npm install framer-motion
```

### Formularios
```bash
npm install react-hook-form zod
```

### Charts (Admin)
```bash
npm install recharts
# O alternativamente
npm install chart.js react-chartjs-2
```

### Notifications
```bash
npm install react-hot-toast
# O alternativamente
npm install sonner
```

### Confetti
```bash
npm install canvas-confetti
```

---

## 🧪 Testing de UI

### Checklist por Pantalla

#### Landing Page
- [ ] Hero visible en < 1s
- [ ] Countdown actualiza cada segundo
- [ ] Imágenes lazy load correctamente
- [ ] CTA button navegable
- [ ] Responsive en 320px (iPhone SE)

#### Confirmación
- [ ] Token inválido muestra 404
- [ ] Botones deshabilitados durante guardado
- [ ] Cambios persisten en reload
- [ ] Formularios validados antes de submit
- [ ] Mobile: botones accesibles con pulgar

#### Mesa de Regalos
- [ ] Filtros funcionan sin lag
- [ ] No se puede apartar regalo ya apartado
- [ ] Imágenes optimizadas (WebP)
- [ ] Grid responsive sin overflow
- [ ] Modal de detalle scrolleable

#### Admin
- [ ] Stats actualiza cada 10s (ISR)
- [ ] Tablas ordenables
- [ ] Datos exportables
- [ ] No expone información sensible
- [ ] Performance con 1000+ registros

---

## 📝 Notas para la IA de UI

### Estilo Visual Objetivo
- **Mood:** Romántico, elegante, moderno
- **Referencias:** Pinterest "Modern Wedding Website", Dribbble "Wedding Invitation UI"
- **Evitar:** Demasiado recargado, colores neón, tipografía cursiva excesiva

### Experiencia de Usuario
- **Prioridad #1:** Simplicidad (usuarios no técnicos)
- **Prioridad #2:** Mobile-first (mayoría usa teléfono)
- **Prioridad #3:** Feedback inmediato en acciones

### Performance
- **Target:** Lighthouse 90+ en mobile
- **Images:** WebP con fallback, lazy loading
- **Fonts:** Solo 2 familias (Inter + Playfair)
- **CSS:** Tailwind JIT, purge unused

---

## 🔗 Links Útiles

- Repo: [GitHub Link]
- Figma: [To be created]
- Supabase: https://cleeumrziseyvctsfxxx.supabase.co
- Builder.io: [Space link]
- Vercel: [To be deployed]

---

**Última actualización:** 10 de Enero, 2026
**Versión:** 1.0.0
