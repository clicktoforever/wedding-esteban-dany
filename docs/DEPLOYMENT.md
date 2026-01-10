# 🚀 Deployment Checklist

Lista completa de verificación antes de ir a producción.

## Pre-Deploy Checklist

### Configuración Supabase ✅

- [ ] Proyecto Supabase creado
- [ ] Schema SQL ejecutado sin errores
- [ ] Tablas verificadas: `guests`, `passes`, `gifts`
- [ ] RLS policies habilitadas en todas las tablas
- [ ] Data de prueba insertada (seed)
- [ ] Credentials copiadas (URL + anon key + service role key)

### Configuración Builder.io ✅

- [ ] Cuenta Builder.io creada
- [ ] Space configurado
- [ ] API Key copiada
- [ ] Modelo "page" creado
- [ ] Preview URL configurada (apuntando a Vercel)

### Configuración Local ✅

- [ ] Repositorio clonado
- [ ] `npm install` ejecutado sin errores
- [ ] `.env.local` creado con todas las variables
- [ ] `npm run dev` funciona correctamente
- [ ] Landing page accesible en localhost:3000
- [ ] Confirmación page funciona con token de prueba
- [ ] Mesa de regalos muestra datos
- [ ] Admin dashboard muestra estadísticas

### Testing Local ✅

- [ ] Flujo completo de confirmación probado:
  - Acceder con token válido
  - Confirmar pase individual
  - Confirmar todos los pases
  - Verificar cambios persisten en DB
  - Verificar admin dashboard refleja cambios
- [ ] Flujo de mesa de regalos probado:
  - Ver lista de regalos
  - Filtrar por categoría
  - Apartar un regalo
  - Verificar no se puede apartar dos veces
  - Verificar admin dashboard refleja cambio
- [ ] Responsiveness verificado:
  - Mobile (375px)
  - Tablet (768px)
  - Desktop (1920px)

## Deploy to Vercel

### 1. Conectar GitHub Repository

```bash
# Si no has pusheado a GitHub aún
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/wedding-esteban-dany.git
git push -u origin main
```

### 2. Import Project en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Selecciona tu repositorio de GitHub
4. Configuración:
   - **Framework Preset**: Next.js (auto-detectado)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 3. Configurar Environment Variables

En la sección "Environment Variables":

```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_BUILDER_API_KEY=f1a0b2c3...
```

**Importante**: Copia EXACTAMENTE los valores de tu `.env.local`

### 4. Deploy

1. Click "Deploy"
2. Espera ~2-3 minutos
3. Verifica build exitoso ✅
4. Click en la URL del deployment

## Post-Deploy Verification

### Verificar Rutas ✅

- [ ] `/` carga (aunque sin contenido Builder.io aún)
- [ ] `/confirm/test_token_carlos_123` muestra confirmación
- [ ] `/gifts` muestra regalos
- [ ] `/admin` muestra dashboard
- [ ] `/ruta-inexistente` muestra 404 custom

### Verificar Funcionalidad ✅

- [ ] Confirmación de pase funciona
- [ ] Cambio de estado persiste en Supabase
- [ ] Apartar regalo funciona
- [ ] No se puede apartar regalo dos veces
- [ ] Admin dashboard muestra datos correctos

### Verificar Performance ✅

Usa [PageSpeed Insights](https://pagespeed.web.dev/):

- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

## Configurar Builder.io Production

### 1. Actualizar Preview URL

1. Builder.io → Models → page → Settings
2. **Preview URL**: `https://tu-dominio.vercel.app?builder.preview=true`
3. **Production URL**: `https://tu-dominio.vercel.app`
4. Save

### 2. Crear Landing Page

1. Builder.io → Content → New → page
2. Configurar:
   - **Name**: Home Page
   - **URL**: `/`
3. En el editor:
   - Drag & drop: Hero section
   - Add: WeddingCountdown component
     - Target Date: `2026-06-15T18:00:00`
   - Add: GalleryGrid component
     - Upload 3-6 imágenes
   - Add: Text sections con info de la boda
   - Add: ConfirmationCTA component
     - WhatsApp number: `+52XXXXXXXXXX`
4. Click "Publish" (no solo Save)

### 3. Verificar Landing Live

1. Abre `https://tu-dominio.vercel.app/`
2. Espera hasta 60 segundos (ISR revalidate)
3. Refresh si no ves cambios
4. Verifica countdown funciona
5. Verifica imágenes cargan

## Generar Invitaciones Reales

### 1. Actualizar Script

Edita `scripts/generate-invites.ts`:

```typescript
// Línea 52: Actualiza el dominio
const confirmUrl = `https://tu-dominio.vercel.app/confirm/${guest.access_token}`

// Array de invitados (línea 80+)
const guestsToInvite: GuestInput[] = [
  {
    mainGuestName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+5215512345678', // Formato: +[código país][número]
    attendees: [
      { name: 'Juan Pérez' },
      { name: 'María López' },
      { name: 'Hijo Menor', dietaryRestrictions: 'Vegetariano' },
    ],
  },
  // ... más invitados
]
```

### 2. Ejecutar Script

```bash
npx tsx scripts/generate-invites.ts
```

### 3. Enviar Invitaciones

Para cada invitado:
1. Copia el link de WhatsApp del output
2. Ábrelo en navegador o móvil
3. Se abre WhatsApp con mensaje pre-formateado
4. Envía

**Ejemplo de mensaje:**
```
¡Hola! Te invitamos a la boda de Esteban y Dany 💍

Confirma tu asistencia aquí: https://tu-dominio.vercel.app/confirm/abc123xyz

¡Esperamos contar con tu presencia!
```

## Monitoreo Post-Launch

### Dashboard Admin

URL: `https://tu-dominio.vercel.app/admin`

Métricas en tiempo real:
- Total invitados
- Pases confirmados/pendientes/declinados
- Regalos apartados
- Lista detallada de todos los invitados

**Recomendación**: Agregar a favoritos y revisar diariamente

### Vercel Analytics

1. Vercel Dashboard → tu proyecto → Analytics
2. Activa Analytics (gratis hasta 2,500 eventos)
3. Monitorea:
   - Page views
   - Top pages
   - Errores
   - Performance metrics

### Supabase Monitoring

1. Supabase Dashboard → Reports
2. Monitorea:
   - API requests (límite: 500MB/mes)
   - Database size (límite: 500MB)
   - Active connections
   - Slow queries

### Alerts

Configura alertas para:
- [ ] Vercel deployment failures (email automático)
- [ ] Supabase > 80% storage (manual check semanal)
- [ ] Builder.io > 20K requests (manual check semanal)

## Backup y Disaster Recovery

### Backup Database

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Dump database
supabase db dump -f backup.sql

# Programar backup semanal (opcional)
# Usa GitHub Actions o cron job
```

### Backup Builder.io Content

1. Builder.io → Content → "/" → ⋯ → Export
2. Guarda JSON localmente
3. Repetir semanalmente o después de cambios mayores

## Custom Domain (Opcional)

### Configurar en Vercel

1. Vercel → Settings → Domains
2. Add domain: `esteban-y-dany.com`
3. Sigue instrucciones de DNS
4. Espera propagación (hasta 48h)

### Actualizar URLs

1. Builder.io → Models → page → Settings
   - Preview URL: `https://esteban-y-dany.com?builder.preview=true`
   - Production URL: `https://esteban-y-dany.com`

2. `scripts/generate-invites.ts`:
   ```typescript
   const confirmUrl = `https://esteban-y-dany.com/confirm/${guest.access_token}`
   ```

3. Re-generar invitaciones con nuevo dominio

## Launch Day Checklist

**1 semana antes:**
- [ ] Todas las invitaciones enviadas
- [ ] Builder.io landing page finalizada
- [ ] Mesa de regalos completa
- [ ] Backup de database tomado
- [ ] Vercel analytics activado

**3 días antes:**
- [ ] Verificar no hay errores en Vercel logs
- [ ] Verificar Supabase connections estables
- [ ] Verificar Builder.io preview funcionando
- [ ] Prueba completa del flujo con familiar/amigo

**Día del lanzamiento:**
- [ ] Monitor admin dashboard frecuentemente
- [ ] Responder dudas de invitados vía WhatsApp
- [ ] Verificar Vercel uptime (should be 99.99%)

**Post-boda:**
- [ ] Descargar lista final de confirmados
- [ ] Backup final de database
- [ ] Agradecer a invitados con mensaje masivo
- [ ] Opcional: Deshabilitar ediciones en Builder.io

## Troubleshooting Común

Si algo falla, consulta [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Contacto de emergencia**:
- Vercel Support: support@vercel.com (reply time: 24-48h)
- Supabase Support: [support.supabase.com](https://support.supabase.com)

---

## 🎉 ¡Felicidades!

Tu plataforma de invitaciones está lista para producción. ¡Que tengan una boda increíble! 💍
