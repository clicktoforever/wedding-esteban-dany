# Documentación Técnica — Boda Carlos & Dany

> Sistema web para la boda de Carlos & Dany (11 de abril de 2026, Quito, Ecuador).  
> Plataforma full-stack que gestiona invitados, confirmaciones de asistencia, mesa de regalos con pagos reales y un sistema de economía gamificada (Machi Coins) para la fiesta.

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura de Carpetas](#4-estructura-de-carpetas)
5. [Rutas y Páginas (Frontend)](#5-rutas-y-páginas-frontend)
6. [API Routes (Backend)](#6-api-routes-backend)
7. [Componentes](#7-componentes)
8. [Librerías y Utilidades (lib/)](#8-librerías-y-utilidades-lib)
9. [Integraciones Externas](#9-integraciones-externas)
10. [Base de Datos (Supabase)](#10-base-de-datos-supabase)
11. [Edge Functions](#11-edge-functions)
12. [Variables de Entorno](#12-variables-de-entorno)
13. [Deployment](#13-deployment)
14. [Flujos Principales de Negocio](#14-flujos-principales-de-negocio)

---

## 1. Visión General

La plataforma tiene tres módulos principales:

| Módulo | Descripción |
|---|---|
| **Invitación Digital** | Landing page pública con cuenta regresiva, galería y detalles del evento |
| **Mesa de Regalos** | Sistema de crowdfunding para regalos con pagos via tarjeta (PayPhone) o transferencia bancaria (Ecuador/México) |
| **Machi Store** | Economía gamificada: los donantes acumulan "Machi Coins" (1 USD = 10 coins) canjeables por premios en la fiesta |
| **Panel Admin** | Dashboard privado para gestionar invitados, confirmar pagos, asignar mesas y revisar estadísticas |

---

## 2. Stack Tecnológico

### Framework y Runtime
| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | ^16.1.1 | Framework full-stack, App Router |
| **React** | ^19.0.0 | UI library |
| **TypeScript** | ^5 | Tipado estático en todo el proyecto |
| **Node.js** | LTS | Runtime de servidor |

### Backend y Base de Datos
| Tecnología | Uso |
|---|---|
| **Supabase** | Backend-as-a-Service: PostgreSQL, Auth, Storage, Edge Functions, RLS |
| **@supabase/ssr** ^0.8.0 | Client SSR-aware para Next.js App Router |
| **PostgreSQL** | Base de datos relacional (via Supabase) |
| **pg_net** | Extension para HTTP calls desde triggers (async) |

### Estilos y UI
| Tecnología | Uso |
|---|---|
| **Tailwind CSS** | ^3.4.1 — utility-first CSS |
| **Google Fonts** | Inter, Playfair Display, Cormorant Garamond, Montserrat, Great Vibes |
| **Material Icons** | Iconografía (Round + Symbols) |
| **Framer Motion** | ^11.18.2 — animaciones |
| **canvas-confetti** | ^1.9.4 — efecto celebración en pagos aprobados |

### Medios e Imágenes
| Tecnología | Uso |
|---|---|
| **Cloudinary** | CDN para imágenes y videos, transformaciones automáticas |
| **next-cloudinary** | ^6.17.5 — componente `CldImage` y `CloudinaryImage` |

### Pagos
| Tecnología | Uso |
|---|---|
| **PayPhone** | Pasarela de pago ecuatoriana, widget embebido, API V2 |
| **Transferencia Bancaria EC** | Banco Pichincha (Ecuador, USD) |
| **Transferencia Bancaria MX** | Banco Santander México (MXN) |

### IA y Validación
| Tecnología | Uso |
|---|---|
| **Google Gemini AI** | ^0.21.0 (`gemini-3-flash-preview`) — validación automática de comprobantes de transferencia |

### Email
| Tecnología | Uso |
|---|---|
| **Nodemailer** | ^8.0.1 — notificaciones SMTP de pagos aprobados |

### Utilidades
| Tecnología | Uso |
|---|---|
| **lucide-react** | ^0.468.0 — iconos adicionales |
| **xlsx** | ^0.18.5 — exportación de datos de invitados |

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│  Landing · Mesa Regalos · Confirmación · Party · Admin      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                   NEXT.JS 16 (Vercel)                        │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │  Server Comps   │  │   API Routes     │                  │
│  │  (RSC / SSR)    │  │  /api/gifts/*    │                  │
│  │                 │  │  /api/guests/*   │                  │
│  │  ISR revalidate │  │  /api/admin/*    │                  │
│  └────────┬────────┘  └───────┬──────────┘                  │
└───────────┼───────────────────┼─────────────────────────────┘
            │                   │
┌───────────▼───────────────────▼─────────────────────────────┐
│                        SUPABASE                              │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  PostgreSQL  │  │  Supabase   │  │  Edge Functions    │  │
│  │  + RLS       │  │  Auth       │  │  confirm-payphone  │  │
│  │  + Triggers  │  │  (Admin)    │  │  -payment          │  │
│  │  + Functions │  │             │  │  (Deno/TypeScript) │  │
│  └──────────────┘  └─────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            │                              │
┌───────────▼──────────┐    ┌─────────────▼───────────────────┐
│    CLOUDINARY         │    │         PAYPHONE                 │
│  Imágenes / Videos   │    │  /api/button/V2/Confirm          │
│  CDN + transforms    │    │  Widget JavaScript embebido      │
└──────────────────────┘    └─────────────────────────────────┘
            │
┌───────────▼──────────┐
│    GOOGLE GEMINI AI   │
│  Validación automá-  │
│  tica de comprobantes │
└──────────────────────┘
```

### Patrón de Caching y Rendering

| Página | Estrategia | Revalidación |
|---|---|---|
| `/` (Home) | ISR | 60 segundos |
| `/gifts` | Dynamic (force-dynamic) | Siempre fresco |
| `/admin` | ISR | 10 segundos |
| `/confirm` | Dynamic | — |
| `/confirm-payment` | Client Component | Polling cada 2s |

---

## 4. Estructura de Carpetas

```
wedding-esteban-dany/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata, TokenTracker)
│   ├── page.tsx                  # Landing page principal (SSR)
│   ├── globals.css               # Estilos globales + variables CSS
│   ├── not-found.tsx             # Página 404
│   ├── admin/                    # Panel administrativo
│   │   ├── layout.tsx            # Layout admin (sin protección extra)
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── login/                # Login admin (Supabase Auth)
│   │   ├── guests/               # Gestión de invitados + pases
│   │   ├── gifts/                # Gestión de regalos
│   │   ├── transactions/         # Revisión de comprobantes
│   │   ├── tables/               # Asignación de mesas
│   │   └── settings/             # Configuraciones del sistema
│   ├── api/
│   │   ├── guests/               # CRUD invitados
│   │   └── gifts/
│   │       ├── contribute/       # Iniciar contribución (crea transacción + PayPhone config)
│   │       ├── confirm-payment/  # Callback PayPhone (redirect)
│   │       ├── transaction-status/ # Polling de estado de transacción
│   │       ├── bank-accounts/    # Datos bancarios EC/MX
│   │       ├── validate-receipt/ # Validación Gemini AI
│   │       └── send-approval-email/ # Envío de email de confirmación
│   ├── confirm/                  # Página RSVP (confirmar/rechazar asistencia)
│   ├── confirm-payment/          # Resultado del pago (confetti, Machi Coins)
│   ├── gifts/                    # Mesa de regalos pública
│   ├── live/                     # Stream en vivo del evento
│   └── party/                    # Versión para invitados de fiesta
│
├── components/
│   ├── admin/                    # Componentes del panel admin
│   ├── confirmation/             # Componentes de confirmación RSVP
│   ├── gifts/                    # Componentes mesa de regalos
│   ├── providers/                # Context providers (UIProvider)
│   ├── AddToCalendarButton.tsx   # Agregar al calendario
│   ├── CloudinaryImage.tsx       # Wrapper de imagen Cloudinary
│   ├── CountdownTimer.tsx        # Cuenta regresiva (Client Component)
│   ├── EventDetails.tsx          # Detalles del evento (lugar, hora)
│   ├── GalleryLightbox.tsx       # Galería con lightbox
│   ├── HomeTracker.tsx           # Tracking de visitas (token de invitado)
│   ├── LiveEventDetails.tsx      # Detalles streaming en vivo
│   ├── RSVPButton.tsx            # Botón flotante de confirmación
│   ├── SeasonsGallery.tsx        # Galería "Nuestra Historia"
│   ├── TokenTracker.tsx          # Lee token de URL y almacena cookie
│   └── VerTrailerButton.tsx      # Botón para ver trailer
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts             # createClient() para Server Components
│   │   └── browser.ts            # createClient() para Client Components
│   ├── database.types.ts         # Tipos TypeScript generados de Supabase
│   ├── currency.ts               # Conversión USD ↔ MXN (1 USD = 20 MXN)
│   ├── email.ts                  # Envío de emails con Nodemailer
│   ├── gemini-receipt-validator.ts # Validación de comprobantes con Gemini AI
│   └── payphone.ts               # Integración PayPhone (tipos, helpers, widget config)
│
├── supabase/
│   ├── schema.sql                # Esquema completo de la base de datos
│   └── functions/
│       └── confirm-payphone-payment/ # Edge Function (Deno)
│
├── public/                       # Assets estáticos
├── scripts/                      # Scripts de utilidad
│   ├── generate-invites.ts       # Generación de invitaciones
│   └── generate-types.sh         # Regenerar database.types.ts desde Supabase
├── docs/
│   └── DOCUMENTATION.md          # Este archivo
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## 5. Rutas y Páginas (Frontend)

### Rutas Públicas

#### `/` — Landing Page Principal
- **Tipo**: Server Component (ISR, revalidate: 60s)
- **Funcionalidad**: Hero con foto de portada, cuenta regresiva hasta la fecha de boda, galería "Nuestra Historia", detalles del evento, acceso a mesa de regalos, botón flotante RSVP.
- **Datos**: Fecha de boda desde `configurations.wedding_date`.
- **Componentes**: `CloudinaryImage`, `CountdownTimer`, `SeasonsGallery`, `EventDetails`, `RSVPButton`, `AddToCalendarButton`, `HomeTracker`.

#### `/gifts` — Mesa de Regalos
- **Tipo**: Server Component (force-dynamic)
- **Funcionalidad**: Lista de regalos con categorías, progreso de crowdfunding, modal de contribución (PayPhone o transferencia bancaria).
- **Token**: Acepta `?token=` para personalizar experiencia según tipo de invitado (wedding/party).
- **Componentes**: `GiftRegistry`, `GiftCard`, `UnifiedContributionModal`, `WelcomeModal`.

#### `/confirm` — Confirmación de Asistencia (RSVP)
- **Tipo**: Mixto (Server + Client)
- **Funcionalidad**: El invitado confirma o declina su asistencia y la de sus acompañantes. Requiere token de invitado en URL.

#### `/confirm-payment` — Resultado de Pago
- **Tipo**: Client Component
- **Funcionalidad**: Muestra resultado del pago (aprobado/rechazando/procesando). Si está en revisión, hace polling cada 2 segundos a `/api/gifts/transaction-status`. Al aprobarse muestra animación de confetti y tarjeta de Machi Coins ganadas (1 USD = 10 coins).

#### `/party` — Vista de Invitados de Fiesta
- **Tipo**: Server Component
- **Funcionalidad**: Versión simplificada para invitados que solo van a la fiesta (sin ceremonia).

#### `/live` — Transmisión en Vivo
- **Tipo**: Server Component
- **Funcionalidad**: Embed de stream en vivo del evento.

### Rutas Admin (protegidas)

Todas las rutas bajo `/admin/` verifican:
1. Sesión activa via `supabase.auth.getUser()`
2. Registro en tabla `admin_users`

| Ruta | Descripción |
|---|---|
| `/admin` | Dashboard con estadísticas generales, cuenta regresiva, acciones urgentes |
| `/admin/login` | Login con email/password via Supabase Auth |
| `/admin/guests` | Lista de invitados, pases, estado de confirmación, notificación WhatsApp |
| `/admin/guests/[id]` | Detalle de invitado, editar pases, asignar mesa |
| `/admin/gifts` | Lista de regalos, progreso de crowdfunding |
| `/admin/transactions` | Comprobantes pendientes de revisión manual (`MANUAL_REVIEW`) |
| `/admin/tables` | Asignación de invitados a mesas |
| `/admin/settings` | Configuraciones: fecha boda, fecha límite RSVP, link DeUna |

---

## 6. API Routes (Backend)

### `POST /api/guests`
Crea un invitado nuevo con sus pases.
- **Body**: `{ name, email?, phone?, passes: [{ attendee_name }] }`
- **Response**: `{ success, guest }`

### `POST /api/gifts/contribute`
Inicia una contribución a un regalo. Crea la transacción en estado `PENDING` y devuelve la configuración para el widget de PayPhone.
- **Body**: `{ giftId, donorName, donorEmail, amount, message? }`
- **Response**: `{ success, transactionId, paymentConfig }`
- **Lógica**: Auto-habilita crowdfunding si no estaba activo. Calcula comisión PayPhone (5% + IVA 15%).

### `GET /api/gifts/confirm-payment?id=&clientTransactionId=`
Callback de redirección de PayPhone tras el pago. Actualiza `payphone_transaction_id` en la transacción (lo que dispara el trigger de BD que llama a la Edge Function). Redirige a `/confirm-payment`.

### `GET /api/gifts/transaction-status?id=` o `?clientTransactionId=`
Consulta el estado actual de una transacción. Usado para polling en el frontend.
- **Response**: `{ success, transaction: { id, donorName, amount, status, message, gift } }`

### `GET /api/gifts/bank-accounts?country=EC|MX`
Devuelve los datos bancarios para transferencia.
- **Response**: `{ success, account: { bankName, accountName, accountNumber, ... } }`

### `POST /api/gifts/validate-receipt`
Valida un comprobante de transferencia usando Gemini AI.
- **Body**: FormData con `receipt` (imagen), `country`, `expectedAmount`, `transactionId`
- **Lógica**: Llama a `GeminiReceiptValidator`. Si pasa → `APPROVED`. Si imagen inválida → `REJECTED`. Si timeout/error técnico → `MANUAL_REVIEW`.

### `POST /api/gifts/send-approval-email`
Envía email de confirmación al donante. Llamado por la Edge Function de forma asíncrona.

---

## 7. Componentes

### Componentes de Regalos (`components/gifts/`)

| Componente | Descripción |
|---|---|
| `GiftRegistry` | Contenedor principal: filtra por categoría, muestra grid masonry, gestiona modales |
| `GiftCard` | Tarjeta de regalo individual con barra de progreso y botón de contribución |
| `UnifiedContributionModal` | Modal multistep: selección de monto → método de pago (tarjeta/transferencia) → validación → resultado |
| `WelcomeModal` | Modal de bienvenida que explica métodos de pago (se muestra una vez al entrar) |
| `InstructionsButton` | Botón flotante con instrucciones de la mesa de regalos |

**Flujo del `UnifiedContributionModal`**:
```
amount (selección) 
  → card: PayPhone Widget JS embebido
  → transfer: datos bancarios + subir comprobante + validación Gemini
    → validating (spinner + progreso)
    → success / review / error
```

### Componentes Admin (`components/admin/`)

| Componente | Descripción |
|---|---|
| `AdminHeader` | Header con logo y botón de configuración |
| `BottomNav` | Navegación inferior mobile-first |
| `WeddingCountdown` | Cuenta regresiva en el dashboard admin |
| `GuestTable` | Tabla de invitados con filtros y acciones |
| `TransactionCard` | Tarjeta de transacción con acciones de aprobar/rechazar |

### Componentes de Confirmación (`components/confirmation/`)
Gestión del flujo RSVP: formulario de confirmación por pase, manejo de acompañantes.

### Componentes Principales

| Componente | Descripción |
|---|---|
| `CloudinaryImage` | Wrapper de `next/image` con URL de Cloudinary, transformaciones automáticas |
| `CountdownTimer` | Cuenta regresiva (`useState`/`useEffect`), Client Component |
| `TokenTracker` | Lee `?token=` de URL y lo almacena en cookie `wedding_token` para acceso personalizado |
| `HomeTracker` | Registra visita del invitado asociando su token con la vista |
| `RSVPButton` | Botón flotante que navega a `/confirm?token=...` con el token del invitado |
| `AddToCalendarButton` | Genera ICS/Google Calendar link |
| `SeasonsGallery` | Carrusel de fotos de la pareja organizadas por temporadas |
| `EventDetails` | Sección con mapa, horarios y detalles de la boda civil |

---

## 8. Librerías y Utilidades (lib/)

### `lib/supabase/server.ts`
```typescript
createClient()            // Server Components / API Routes
createClientWithToken()   // Establece contexto RLS con token de invitado
```
- Configurado con `persistSession: false`, `autoRefreshToken: false` para optimización serverless.
- Timeout de 8 segundos en fetch.
- Keep-alive para reusar conexiones HTTP.

### `lib/supabase/browser.ts`
```typescript
createClient()            // Client Components
```
- `createBrowserClient` de `@supabase/ssr`.

### `lib/payphone.ts`
Toda la lógica de integración con PayPhone:

```typescript
createPayPhoneWidgetConfig(params)  // Genera config para el widget JS embebido
createPayPhonePayment(config)       // Crea request server-to-server (deprecated)
preparePayPhonePayment(data)        // Llama a PayPhone Prepare API
confirmPayPhonePayment(txId, ctxId) // Confirma pago con PayPhone
generateClientTransactionId(giftId) // Genera ID único por transacción
formatCurrency(amount, currency)    // Formatea moneda
```

**Cálculo de comisiones PayPhone**:
- PayPhone cobra 5% + IVA 15% sobre el total.
- Para recibir exactamente el monto del regalo, se hace gross-up: `total = baseAmount / (1 - 0.05 * 1.15)`.
- El split para la API: `amountWithoutTax` (regalo), `amountWithTax` (base comisión sin IVA), `tax` (IVA de comisión).

### `lib/currency.ts`
```typescript
USD_TO_MXN_RATE = 20      // Tipo de cambio fijo
usdToMxn(amount)           // USD → MXN
mxnToUsd(amount)           // MXN → USD
getDisplayAmount(usd, country) // Muestra monto en la moneda del país
convertToUsd(amount, country)  // Normaliza a USD para guardar en BD
```

### `lib/gemini-receipt-validator.ts`
Clase `GeminiReceiptValidator`:
- Usa `gemini-3-flash-preview` para visión de documentos.
- Carga cuentas bancarias desde variables de entorno.
- `validateReceipt(imageBuffer, country, expectedAmount, orderId)` → `ReceiptValidationResult`.
- Timeout de 45s (respeta el límite de 60s de Vercel).
- Tolerancia de ±$0.50 en el monto.
- Distingue errores: imagen inválida → `INVALID_IMAGE`, timeout → `TIMEOUT`, otros → `TECHNICAL_ERROR`.

### `lib/email.ts`
- `sendTransactionApprovedEmail(data)` — HTML email con Nodemailer.
- Diseño personalizado con logos, Machi Coins ganadas, detalles de la transacción y CTA.
- Si faltan variables SMTP, falla silenciosamente (no bloquea el flujo principal).

---

## 9. Integraciones Externas

### PayPhone
- **Tipo**: Widget JavaScript embebido en el frontend.
- **Flujo**: Frontend carga `/api/gifts/contribute` → obtiene `paymentConfig` → renderiza `new PPaymentButtonBox(config).render('pp-button')` → usuario paga → PayPhone redirige a `/api/gifts/confirm-payment?id=&clientTransactionId=` → trigger BD → Edge Function confirma con `V2/Confirm API`.
- **Env**: `PAYPHONE_TOKEN`, `PAYPHONE_STORE_ID`, `PAYPHONE_API_URL`.

### Cloudinary
- Todas las imágenes se sirven desde `res.cloudinary.com/machiboda/`.
- Transformaciones automáticas: `f_auto,q_auto` para formato y calidad óptimos.
- `CloudinaryImage` wrapper construye URLs con parámetros de transformación.
- Videos: loading animation, icons.

### Google Gemini AI
- Modelo: `gemini-3-flash-preview`.
- Uso: analizar imágenes de comprobantes bancarios.
- Prompt multimodal: imagen + texto con datos de la cuenta destino y monto esperado.
- Responde JSON con `extracted` (datos del comprobante) y `validation` (resultado).
- **Env**: `GEMINI_API_KEY`.

### Supabase Auth
- Usado exclusivamente para el panel admin.
- Email/password authentication.
- Tabla `admin_users` como segunda capa de autorización.
- Middleware implícito: cada página admin verifica `getUser()` + existencia en `admin_users`.

### SMTP (Email)
- **Env**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`.
- Emails de confirmación de pago al donante.

---

## 10. Base de Datos (Supabase)

La base de datos completa está documentada en `supabase/schema.sql`.

### Diagrama de Relaciones

```
auth.users (Supabase Auth)
    │
    ├── admin_users (user_id FK)
    └── store_users (id FK, nullable)

guests
    └── passes (guest_id FK)
            └── tables (table_id FK)

gifts
    └── gift_transactions (gift_id FK)
            └── wallet_transactions (source_gift_id FK)

store_users (email PK)
    ├── wallet_transactions (user_id / user_email)
    ├── purchased_items (user_id FK)
    └── guest_photos (guest_id FK)

store_items
    └── purchased_items (item_id FK)

configurations (key-value store)
```

### Tablas

| Tabla | Filas aprox. | Descripción |
|---|---|---|
| `guests` | 91 | Invitados (familias/grupos) |
| `passes` | 130 | Pases individuales por asistente |
| `gifts` | 27 | Regalos de la mesa |
| `gift_transactions` | 104 | Contribuciones/pagos a regalos |
| `admin_users` | 2 | Usuarios con acceso al panel |
| `tables` | 11 | Mesas del evento |
| `configurations` | 4 | Configuraciones (fecha boda, DeUna link, etc.) |
| `store_users` | 50 | Wallets de Machi Coins |
| `store_items` | 10 | Premios/experiencias en la tienda |
| `wallet_transactions` | 261 | Historial de movimientos de coins |
| `purchased_items` | 200 | Compras con QR para canjear |
| `guest_photos` | — | Fotos subidas por invitados (paparazzi) |

### Enums

```sql
confirmation_status: pending | confirmed | declined
transaction_status:  PENDING | APPROVED | REJECTED | PROCESSING | MANUAL_REVIEW
wallet_transaction_type: GIFT_REWARD | STORE_PURCHASE | BONUS | ADMIN_ADJUSTMENT
purchase_status: ACTIVE | REDEEMED | EXPIRED
```

### Vista: `gift_progress`
Calculada en tiempo real: muestra el progreso de cada regalo de crowdfunding.
Columnas: `id, name, total_amount, collected_amount, status, is_crowdfunding, remaining_amount, progress_percentage, total_contributions, approved_contributions`.

### Funciones RPC Principales

| Función | Descripción |
|---|---|
| `approve_gift_transaction(transaction_id)` | Aprueba una transacción atómicamente y actualiza `collected_amount` del regalo |
| `get_wedding_stats()` | Devuelve estadísticas del evento (guests, passes, gifts, contributions) |
| `purchase_store_item(item_id, user_id)` | Compra un item de la tienda con bloqueo pesimista |
| `play_gacha(user_id)` | Ruleta de premios aleatoria ponderada por rareza |
| `redeem_qr_code(qr_code, staff_name)` | Canjea un premio en la fiesta |
| `delete_gift_transaction(transaction_id)` | Elimina transacción y revierte coins del wallet |
| `upload_paparazzi_photo(guest_id, image_url)` | Sube foto y otorga coins (máx 10/día) |
| `is_admin(user_id?)` | Verifica si un usuario es admin |
| `is_gift_completed(gift)` | Verifica si un regalo alcanzó su meta |

### Triggers

| Trigger | Tabla | Evento | Función |
|---|---|---|---|
| `on_gift_approved` | `gift_transactions` | AFTER INSERT/UPDATE | `mint_coins_from_gift()` — acuña Machi Coins al aprobarse un pago |
| `on_transaction_payphone_id_update` | `gift_transactions` | AFTER UPDATE | `trigger_confirm_payphone_payment()` — llama Edge Function via pg_net |
| `trigger_update_gift_collected_amount` | `gift_transactions` | AFTER INSERT/UPDATE/DELETE | `update_gift_collected_amount()` — recalcula `collected_amount` |
| `trigger_update_contributor_count` | `gift_transactions` | AFTER INSERT/UPDATE | `update_gift_contributor_count()` — cuenta donantes únicos |
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` — crea `store_users` y linkea `wallet_transactions` |
| `update_*_updated_at` | Varias | BEFORE UPDATE | `update_updated_at_column()` — mantiene `updated_at` |
| `trigger_update_configurations_updated_at` | `configurations` | BEFORE UPDATE | `update_configurations_updated_at()` |
| `tables_updated_at` | `tables` | BEFORE UPDATE | `update_tables_updated_at()` |

### Flujo de Acuñación de Machi Coins
```
gift_transactions INSERT/UPDATE
  → trigger on_gift_approved
    → mint_coins_from_gift()
      → store_users (upsert)
      → store_users.current_balance += floor(amount * 10)
      → wallet_transactions INSERT (type: GIFT_REWARD)
```

### Flujo de Confirmación PayPhone
```
API /api/gifts/confirm-payment recibe callback
  → UPDATE gift_transactions SET payphone_transaction_id = id
    → trigger on_transaction_payphone_id_update
      → trigger_confirm_payphone_payment()
        → pg_net.http_post() a Edge Function (async)
          → Edge Function llama PayPhone V2/Confirm API
            → Si Approved: RPC approve_gift_transaction()
              → UPDATE gift_transactions SET status = APPROVED
                → trigger on_gift_approved → mint_coins_from_gift()
            → Si Rejected: UPDATE status = REJECTED
          → Fire-and-forget: /api/gifts/send-approval-email
```

### Políticas RLS Clave

- `guests`, `passes`, `tables`: acceso público (lectura, escritura, actualización) — autenticación por token en la URL, no en BD.
- `gifts`, `gift_transactions`: lectura pública, escritura solo con service key.
- `configurations`: lectura pública, escritura solo admin.
- `admin_users`: solo admins.
- `store_users`: lectura pública por email, escritura propia + service role.
- `store_items`: lectura si `is_active = true`, gestión por service role.
- `wallet_transactions`, `purchased_items`: solo propio + service role.

---

## 11. Edge Functions

### `confirm-payphone-payment` (Deno/TypeScript)
**Status**: ACTIVE, v7

**Trigger**: Llamada por el trigger de BD `on_transaction_payphone_id_update` via `pg_net.http_post()`.

**Flujo**:
1. Recibe payload con datos de la transacción.
2. Espera 100ms para que PayPhone procese.
3. Llama a `POST https://pay.payphonetodoesposible.com/api/button/V2/Confirm`.
4. Si `transactionStatus === 'Approved'`: llama a `RPC approve_gift_transaction`.
5. Si rechazado: actualiza `status = REJECTED`.
6. En background (fire-and-forget): llama a `/api/gifts/send-approval-email`.

**Env requeridas**: `PAYPHONE_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_APP_URL`.

---

## 12. Variables de Entorno

### Requeridas para producción

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Solo server/Edge Functions

# PayPhone
PAYPHONE_TOKEN=...
PAYPHONE_STORE_ID=...
PAYPHONE_API_URL=https://pay.payphonetodoesposible.com

# Google Gemini AI
GEMINI_API_KEY=...

# App URL
NEXT_PUBLIC_APP_URL=https://www.clicktoforever.com

# Cuentas bancarias (para validación Gemini)
BANK_ACCOUNT_EC_NAME=...
BANK_ACCOUNT_EC_NUMBER=...
BANK_ACCOUNT_EC_TYPE=Ahorros
BANK_ACCOUNT_EC_ID=...
BANK_ACCOUNT_MX_NAME=...
BANK_ACCOUNT_MX_CARD=...

# Email (SMTP) - Opcional, falla silenciosamente si no están
SMTP_HOST=...
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
SMTP_FROM_EMAIL=...
SMTP_FROM_NAME=...
```

### Variables de Entorno en Edge Function (Supabase Dashboard)
```env
PAYPHONE_TOKEN=...
SUPABASE_URL=...              # Auto-provisto por Supabase
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_APP_URL=https://www.clicktoforever.com
```

---

## 13. Deployment

### Plataforma: Vercel

El proyecto se despliega en Vercel con configuración en `vercel.json`.

**Comandos**:
```bash
npm run dev      # Desarrollo local (Turbopack)
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # ESLint
npm run generate-types  # Regenerar database.types.ts desde Supabase
```

### Consideraciones de Producción

1. **Timeout de Vercel**: Las funciones serverless tienen 60s de timeout. La validación Gemini usa timeout de 45s para no excederlo. La Edge Function de Supabase no tiene este límite.
2. **ISR**: Las páginas usan `revalidate` para equilibrar frescura y rendimiento.
3. **Supabase Connection Pooling**: El cliente de servidor tiene `keepalive: true` y `AbortSignal.timeout(8000)`.
4. **Cloudinary CDN**: Todas las imágenes se sirven desde CDN con transformaciones automáticas (`f_auto,q_auto`).

### Regenerar Tipos de Base de Datos
```bash
npm run generate-types
# Ejecuta: supabase gen types typescript --project-id [project-id] > lib/database.types.ts
```

---

## 14. Flujos Principales de Negocio

### 1. Invitado Confirma Asistencia
```
Invitado recibe link → /confirm?token=[token]
  → TokenTracker guarda cookie wedding_token
  → Página carga pases del invitado
  → Invitado confirma/declina cada pase
  → UPDATE passes SET confirmation_status = 'confirmed' | 'declined'
```

### 2. Regalo con Tarjeta (PayPhone)
```
Invitado elige regalo → Modal contribución → ingresa monto y email
  → POST /api/gifts/contribute → crea gift_transactions (PENDING)
  → Frontend renderiza PayPhone Widget con paymentConfig
  → Invitado paga con tarjeta
  → PayPhone redirige → GET /api/gifts/confirm-payment
  → UPDATE gift_transactions SET payphone_transaction_id = id
  → Trigger BD → pg_net → Edge Function
  → Edge Function: PayPhone V2/Confirm → approve_gift_transaction()
  → Trigger mint_coins_from_gift() → Machi Coins acuñadas
  → Frontend polling detecta APPROVED
  → /confirm-payment muestra tarjeta de recompensa con coins
```

### 3. Regalo con Transferencia Bancaria
```
Invitado elige regalo → Modal → selecciona "Transferencia"
  → Carga datos bancarios del país (EC/MX)
  → Invitado sube comprobante (imagen)
  → POST /api/gifts/validate-receipt
  → Gemini AI analiza imagen
    → Alto confidence + datos correctos → APPROVED automático
    → Imagen inválida → REJECTED
    → Timeout/Error → MANUAL_REVIEW (admin revisa manualmente)
```

### 4. Machi Coins y Tienda de la Fiesta
```
Pago aprobado → mint_coins_from_gift() → store_users.current_balance += coins
  → Invitado va a machiboda.clicktoforever.com
  → Login con email (Supabase Auth) → handle_new_user() linkea wallet
  → Browse store_items → purchase_store_item() (bloqueo pesimista)
  → purchased_items con qr_code único generado
  → En la fiesta: staff escanea QR → redeem_qr_code()
  → Item REDEEMED, timestamp y nombre del staff registrado
```

### 5. Gacha (Ruleta de Premios)
```
Invitado tiene ≥75 Machi Coins → play_gacha()
  → Algoritmo de ruleta ponderada por rareza
    rarity 1 (Común): peso 60
    rarity 2: peso 30
    rarity 3: peso 15
    rarity 4: peso 5
    rarity 5 (Legendario): peso 1
  → random * total_weight selecciona item
  → Descuenta 75 coins, reduce stock, crea purchased_items
```
