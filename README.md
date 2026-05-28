# Boda Carlos & Dany

Sitio web para la boda de Carlos y Dany. Gestiona invitaciones, RSVP, mesa de regalos con crowdfunding, y el sistema de Machi Coins (gamificación).

> Documentación completa: [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)  
> Schema de base de datos: [supabase/schema.sql](supabase/schema.sql)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, RLS, Edge Functions, Storage) |
| Pagos | PayPhone (Ecuador) |
| Imágenes | Cloudinary CDN |
| IA | Google Gemini AI (validación de comprobantes) |
| Email | Nodemailer + SMTP |
| Deploy | Vercel |

---

## Inicio rápido

### Requisitos
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com)

### Instalación

```bash
git clone <repo>
cd wedding-esteban-dany
npm install
cp .env.local.example .env.local  # completar variables
npm run dev
```

### Variables de entorno principales

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PAYPHONE_APP_ID=
PAYPHONE_TOKEN=
CLOUDINARY_CLOUD_NAME=
GEMINI_API_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

Ver [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) para la lista completa.

### Base de datos

```bash
# En Supabase SQL Editor, ejecutar:
supabase/schema.sql
```

---

## Estructura

```
app/              → Rutas Next.js (App Router)
  admin/          → Panel de administración (/admin)
  api/            → Route handlers (pagos, email, regalos, store)
  gifts/          → Mesa de regalos pública
  confirm/        → Confirmación de asistencia por token
  confirm-payment/→ Confirmación pago PayPhone (webhook)
  live/           → Vista del evento en vivo
  party/          → Sección de fiesta / Machi Store
components/       → Componentes React reutilizables
lib/              → Supabase client, currency, email, Gemini, PayPhone
supabase/
  schema.sql      → Schema completo de la BD (ejecutar para setup)
  functions/      → Edge Functions (Deno/TypeScript)
docs/
  DOCUMENTATION.md → Documentación técnica completa
```

---

## Funcionalidades principales

- **RSVP por token**: Cada invitado recibe una URL única sin login
- **Mesa de regalos con crowdfunding**: Regalos individuales y aportaciones parciales
- **Pagos**: PayPhone (Ecuador) y transferencias bancarias (Ecuador + México)
- **Validación con IA**: Gemini AI verifica comprobantes de transferencia
- **Machi Coins**: Gamificación — cada dólar donado = 10 monedas canjeables en la tienda
- **Panel admin**: Dashboard con estadísticas, gestión de invitados, mesas y transacciones
- **Vista en vivo**: Reproducción del evento en streaming
