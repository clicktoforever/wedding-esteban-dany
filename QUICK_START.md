# 🚀 Guía Rápida de Configuración - Wedding Platform

## ✅ Estado Actual
- ✅ Dependencias instaladas
- ✅ Servidor corriendo en http://localhost:3000
- ⏳ Falta configurar Supabase
- ⏳ Falta configurar Builder.io

---

## 📋 PASO 1: Configurar Supabase (15 minutos)

### 1.1 Crear Proyecto Supabase

1. Ve a: **https://supabase.com/dashboard**
2. Click en **"New Project"**
3. Configura:
   - **Name**: `wedding-Carlos-dany`
   - **Database Password**: (genera una y guárdala en un lugar seguro)
   - **Region**: `South America (São Paulo)` o el más cercano
4. Click **"Create new project"** → Espera 2-3 minutos

### 1.2 Ejecutar el Schema SQL

1. En el dashboard de Supabase, ve a **SQL Editor** (icono de terminal en la barra lateral)
2. Click en **"New query"**
3. Abre este archivo: `supabase/schema.sql`
4. Copia TODO el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Click en **"Run"** (botón verde en la esquina inferior derecha)
7. Deberías ver mensaje: **"Success. No rows returned"**

### 1.3 Verificar Tablas Creadas

1. Ve a **Table Editor** (icono de tabla en la barra lateral)
2. Deberías ver 3 tablas:
   - ✅ `guests` (con 3 registros de prueba)
   - ✅ `passes` (con 6 registros de prueba)
   - ✅ `gifts` (con 6 registros de prueba)

### 1.4 Copiar Credenciales

1. Ve a **Settings → API** (icono de engranaje)
2. Copia estas 3 credenciales:

   **A) Project URL:**
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   (Está en la sección "Project URL")

   **B) anon public:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Está en "Project API keys" → `anon` `public`)

   **C) service_role:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Está en "Project API keys" → `service_role` `secret` → Click "Reveal")

### 1.5 Actualizar .env.local

Abre tu archivo `.env.local` y actualiza:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 1.6 Verificar Conexión

1. Guarda el archivo `.env.local`
2. En tu terminal, presiona `Ctrl+C` para detener el servidor
3. Ejecuta: `npm run dev`
4. Ve a: http://localhost:3000/confirm/test_token_carlos_123
5. Deberías ver la página de confirmación con 3 pases ✅

---

## 📋 PASO 2: Configurar Builder.io (10 minutos)

### 2.1 Crear Cuenta Builder.io

1. Ve a: **https://builder.io**
2. Click en **"Get Started Free"**
3. Regístrate con GitHub (recomendado) o email
4. Crea un nuevo Space: `wedding-Carlos-dany`

### 2.2 Copiar API Key

1. En el dashboard, click en tu perfil (esquina superior derecha)
2. Ve a **Account Settings**
3. En la barra lateral, click en **Space Settings**
4. Copia el **Public API Key**:
   ```
   f1a0b2c3d4e5f6g7h8i9j0k1l2m3n4o5
   ```

### 2.3 Actualizar .env.local

Abre tu archivo `.env.local` y agrega:

```env
NEXT_PUBLIC_BUILDER_API_KEY=tu_api_key_aqui
```

### 2.4 Configurar Preview URL

1. En Builder.io, ve a **Models** (barra lateral)
2. Click en **"+ New Model"**
3. Selecciona **"Page"**
4. Configura:
   - **Name**: `page`
   - **Type**: Page
5. Click **"Create Model"**
6. En la página del modelo, click en **"Settings"** (tab superior)
7. En **"Preview URL"**, ingresa:
   ```
   http://localhost:3000?builder.preview=true
   ```
8. Click **"Save"**

### 2.5 Crear Primera Página

1. Ve a **Content** (barra lateral)
2. Click **"+ New"** → **"page"**
3. Configura:
   - **Name**: `Home Page`
   - **URL Path**: `/`
4. Click **"Create"**

### 2.6 Agregar Contenido

En el editor visual:

1. **Arrastra componentes desde la barra lateral izquierda:**
   - Text → Escribe "Boda Carlos & Dany"
   - Heading → Configura como H1
   - Busca **"WeddingCountdown"** en "Custom Components"
     - Arrastra al canvas
     - Configura Target Date: `2026-06-15T18:00:00`

2. **Publica:**
   - Click **"Publish"** (botón verde esquina superior derecha)

3. **Verifica:**
   - Ve a: http://localhost:3000
   - Espera hasta 60 segundos (ISR cache)
   - Deberías ver tu contenido ✅

---

## 🎯 Verificación Final (Checklist)

Prueba estas URLs en tu navegador:

- [ ] **http://localhost:3000**
  - ✅ Debería mostrar contenido de Builder.io (después de publicar)
  - ❌ Si muestra "La página está siendo configurada" → Falta publicar en Builder.io

- [ ] **http://localhost:3000/confirm/test_token_carlos_123**
  - ✅ Debería mostrar página de confirmación con 3 pases
  - ✅ Prueba confirmar un pase → Debería actualizar inmediatamente
  - ❌ Si da error → Revisa credenciales de Supabase en .env.local

- [ ] **http://localhost:3000/gifts**
  - ✅ Debería mostrar 6 regalos
  - ✅ Prueba apartar un regalo → Debería cambiar a "Apartado"
  - ❌ Si da error → Revisa credenciales de Supabase

- [ ] **http://localhost:3000/admin**
  - ✅ Debería mostrar dashboard con estadísticas
  - ✅ Deberías ver: 3 invitados, 6 pases, 6 regalos
  - ❌ Si da error → Revisa credenciales de Supabase

---

## 🆘 Troubleshooting Rápido

### Error: "supabaseUrl and supabaseKey are required"
- ❌ Problema: Variables de entorno no configuradas
- ✅ Solución: Revisa que `.env.local` tenga las 3 variables de Supabase
- ✅ Solución: Reinicia el servidor: `Ctrl+C` → `npm run dev`

### Error: "Builder.io content not loading"
- ❌ Problema: API key incorrecta o no publicaste en Builder.io
- ✅ Solución: Verifica NEXT_PUBLIC_BUILDER_API_KEY en `.env.local`
- ✅ Solución: Ve a Builder.io → Content → "/" → Click "Publish"

### Error: "new row violates row-level security policy"
- ❌ Problema: Schema SQL no se ejecutó correctamente
- ✅ Solución: Ve a Supabase SQL Editor y ejecuta `schema.sql` de nuevo

### Página en blanco o error 500
- ❌ Problema: Alguna variable de entorno está mal
- ✅ Solución: Verifica cada variable en `.env.local`
- ✅ Solución: Asegúrate que no haya espacios extras
- ✅ Solución: Reinicia el servidor

---

## 📝 Resumen de Credenciales Necesarias

Tu archivo `.env.local` debe verse así:

```env
# Supabase (3 variables)
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUz...

# Builder.io (1 variable)
NEXT_PUBLIC_BUILDER_API_KEY=f1a0b2c3d4e5...
```

---

## 🎉 Próximos Pasos (Opcional)

Una vez que todo funcione localmente:

1. **Deploy a Vercel**: Ver `docs/DEPLOYMENT.md`
2. **Generar invitaciones**: Edita `scripts/generate-invites.ts`
3. **Personalizar landing**: Usa el editor visual de Builder.io

---

**¿Tienes algún problema?** Consulta `docs/TROUBLESHOOTING.md` para más ayuda detallada.
