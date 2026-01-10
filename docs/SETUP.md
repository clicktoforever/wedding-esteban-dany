# 📚 Guía de Configuración Completa

Esta guía te llevará paso a paso desde cero hasta tener la aplicación funcionando en producción.

## Prerequisitos

- Node.js 20+ instalado
- Git instalado
- Cuenta en GitHub
- Editor de código (VS Code recomendado)

## Paso 1: Crear Proyecto Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Crea una nueva organización o usa una existente
4. Click en "New Project"
5. Configura:
   - **Name**: `wedding-esteban-dany`
   - **Database Password**: Genera una contraseña segura y guárdala
   - **Region**: Elige la más cercana a tus invitados
6. Click en "Create new project" (tarda ~2 minutos)

### Ejecutar Schema SQL

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Click en "New query"
3. Copia y pega el contenido completo de `supabase/schema.sql`
4. Click en "Run" (botón verde)
5. Verifica que se ejecutó sin errores
6. Ve a **Table Editor** y confirma que ves las tablas: `guests`, `passes`, `gifts`

### Copiar Credenciales

1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
   - **anon public key** (empieza con `eyJ...`)
3. Ve a **Settings** → **API** → **Service role**
4. Copia el **service_role key** (⚠️ NUNCA expongas esta clave públicamente)

## Paso 2: Crear Proyecto Builder.io

1. Ve a [builder.io](https://builder.io)
2. Click en "Get Started Free"
3. Regístrate con GitHub (recomendado)
4. Crea una nueva organización: `wedding-esteban-dany`
5. En el dashboard, ve a **Account** → **Space Settings** → **API Keys**
6. Copia el **Public API Key** (empieza con algo como `f1a0...`)

## Paso 3: Configurar Proyecto Local

### Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/wedding-esteban-dany.git
cd wedding-esteban-dany
```

### Instalar Dependencias

```bash
npm install
```

### Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` con tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   NEXT_PUBLIC_BUILDER_API_KEY=f1a0b2c3...
   ```

### Verificar Instalación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

**Deberías ver:**
- `/` → Mensaje de bienvenida (placeholder hasta configurar Builder.io)
- `/confirm/test_token_carlos_123` → Página de confirmación con 3 pases
- `/gifts` → Mesa de regalos con 6 regalos de ejemplo
- `/admin` → Dashboard con estadísticas

## Paso 4: Deploy a Vercel

### Opción A: Deploy desde GitHub (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New" → "Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click en "Environment Variables"
6. Agrega las 4 variables de entorno (copia de `.env.local`)
7. Click en "Deploy"
8. Espera ~2-3 minutos
9. ¡Tu sitio está en vivo! Copia la URL (ej: `wedding-esteban-dany.vercel.app`)

### Opción B: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables de entorno en dashboard de Vercel
# Settings → Environment Variables

# Deploy a producción
vercel --prod
```

## Paso 5: Configurar Builder.io con Vercel

1. En Builder.io dashboard, ve a **Models**
2. Click en "Create New Model"
3. Configura:
   - **Type**: Page
   - **Name**: `page`
   - Click en "Create Model"
4. Ve a **Settings** (del modelo page)
5. En **Preview URL**, configura:
   ```
   https://tu-dominio.vercel.app?builder.preview=true
   ```
6. Click en "Save"

### Crear Primera Página

1. Ve a **Content**
2. Click en "New" → "page"
3. Configura:
   - **URL**: `/`
   - **Name**: `Home Page`
4. En el editor visual:
   - Arrasta componentes desde la barra lateral
   - Prueba los custom components: WeddingCountdown, GalleryGrid, ConfirmationCTA
   - Edita textos e imágenes
5. Click en "Publish"
6. Ve a `https://tu-dominio.vercel.app/` (puede tardar hasta 60 segundos por ISR)

## Paso 6: Generar Invitaciones

### Editar Lista de Invitados

1. Abre `scripts/generate-invites.ts`
2. Modifica el array `guestsToInvite`:
   ```typescript
   const guestsToInvite: GuestInput[] = [
     {
       mainGuestName: 'Juan Pérez',
       email: 'juan@example.com',
       phone: '+5215512345678',
       attendees: [
         { name: 'Juan Pérez' },
         { name: 'María López' },
       ],
     },
     // ... más invitados
   ]
   ```

3. En la línea 52, actualiza el dominio:
   ```typescript
   const confirmUrl = `https://tu-dominio.vercel.app/confirm/${guest.access_token}`
   ```

### Ejecutar Script

```bash
npx tsx scripts/generate-invites.ts
```

**Output esperado:**
```
✅ Invitación generada exitosamente!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Invitado: Juan Pérez
📧 Email: juan@example.com
📱 Teléfono: +5215512345678
👥 Pases: 2
   • Juan Pérez
   • María López

🔗 URL de Confirmación:
   https://tu-dominio.vercel.app/confirm/abc123...

💬 Link de WhatsApp:
   https://wa.me/5215512345678?text=...
```

### Enviar Invitaciones

1. Copia el link de WhatsApp generado
2. Ábrelo en tu navegador o móvil
3. Se abrirá WhatsApp con el mensaje pre-formateado
4. Envíalo al invitado

## Paso 7: Monitoreo y Mantenimiento

### Ver Confirmaciones en Tiempo Real

- Accede a `https://tu-dominio.vercel.app/admin`
- Refresca la página para ver actualizaciones (ISR 10s)

### Verificar Logs de Errores

- **Vercel**: Dashboard → Project → Deployments → Runtime Logs
- **Supabase**: Dashboard → Logs

### Actualizar Landing Page

- Accede a Builder.io → Content → "/" → Edit
- Haz cambios en el editor visual
- Click en "Publish"
- Los cambios se reflejan en < 60 segundos

## Checklist Final ✅

Antes de enviar invitaciones, verifica:

- [ ] Supabase está configurado con schema ejecutado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Builder.io tiene preview URL apuntando a Vercel
- [ ] Landing page publicada en Builder.io
- [ ] Página `/confirm/test_token_carlos_123` funciona correctamente
- [ ] Mesa de regalos `/gifts` muestra los regalos
- [ ] Dashboard `/admin` muestra estadísticas correctas
- [ ] Script `generate-invites.ts` tiene dominio correcto
- [ ] Has probado el flujo completo:
  1. Generar invitación
  2. Abrir link de confirmación
  3. Confirmar pases
  4. Verificar en dashboard admin
  5. Apartar regalo
  6. Verificar en dashboard admin

## Troubleshooting

Si encuentras problemas, consulta [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Soporte

Para issues técnicos, abre un issue en GitHub o revisa la documentación de:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Builder.io Docs](https://www.builder.io/c/docs)
- [Vercel Docs](https://vercel.com/docs)
