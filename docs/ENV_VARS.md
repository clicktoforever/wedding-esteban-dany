# 🔑 Variables de Entorno

Esta guía documenta todas las variables de entorno necesarias para el proyecto.

## Ubicación

- **Desarrollo Local**: `.env.local` (en la raíz del proyecto)
- **Vercel Production**: Dashboard → Settings → Environment Variables
- **Scripts**: `.env.local` es leído automáticamente por `tsx`

## Variables Requeridas

### NEXT_PUBLIC_SUPABASE_URL

**Descripción**: URL de tu proyecto Supabase

**Formato**: `https://[project-id].supabase.co`

**Dónde obtenerla**:
1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Settings → API → Project URL

**Ejemplo**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

**⚠️ Seguridad**: Esta variable es **pública** (prefijo `NEXT_PUBLIC_`). Se expone en el cliente.

**Usos**:
- Cliente Supabase en Server Components (`lib/supabase/server.ts`)
- Cliente Supabase en Client Components (`lib/supabase/browser.ts`)
- Script de generación de invitaciones

---

### NEXT_PUBLIC_SUPABASE_ANON_KEY

**Descripción**: Clave pública de Supabase para autenticación anónima

**Formato**: JWT largo que empieza con `eyJ...`

**Dónde obtenerla**:
1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Settings → API → Project API keys → `anon` `public`

**Ejemplo**:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0...
```

**⚠️ Seguridad**: Esta clave es **pública** pero está protegida por Row Level Security (RLS). Solo permite operaciones autorizadas por las políticas RLS.

**Usos**:
- Todas las operaciones de lectura/escritura desde el cliente
- Queries que respetan RLS policies

---

### SUPABASE_SERVICE_ROLE_KEY

**Descripción**: Clave de servicio con permisos de administrador que **bypasea RLS**

**Formato**: JWT largo que empieza con `eyJ...`

**Dónde obtenerla**:
1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Settings → API → Project API keys → `service_role` `secret`

**Ejemplo**:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ...
```

**🚨 CRÍTICO**: Esta clave debe mantenerse **COMPLETAMENTE SECRETA**:
- ❌ NUNCA la expongas en el código cliente
- ❌ NUNCA la subas a Git (verificar `.gitignore` incluye `.env.local`)
- ❌ NUNCA la uses en variables con prefijo `NEXT_PUBLIC_`
- ✅ Solo úsala en server-side code o scripts CLI

**Usos**:
- Script `scripts/generate-invites.ts` (batch insert de invitados)
- Operaciones admin que requieren bypass de RLS
- **NO** se usa en la app Next.js en runtime

**Permisos**: Acceso completo a todas las tablas sin restricciones RLS

---

### GEMINI_API_KEY

**Descripción**: API Key de Google Gemini para validación automática de comprobantes de transferencia bancaria

**Formato**: String alfanumérico (ejemplo: `AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q`)

**Dónde obtenerla**:
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Click en "Get API Key" o "Create API Key"
4. Copia la clave generada

**Ejemplo**:
```env
GEMINI_API_KEY=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q
```

**🎁 Tier Gratuito**:
- ✅ 15 requests/minuto GRATIS
- ✅ 1,500 requests/día GRATIS
- ✅ No requiere tarjeta de crédito
- ✅ Modelo: `gemini-1.5-flash`

**🚨 Seguridad**: Esta clave debe mantenerse **PRIVADA**:
- ❌ NUNCA la expongas en código cliente
- ❌ NUNCA uses el prefijo `NEXT_PUBLIC_`
- ✅ Solo úsala en API Routes server-side

**Usos**:
- Validación automática de comprobantes de transferencia (EC y MX)
- OCR y extracción de datos de imágenes
- `/api/gifts/transfer` (endpoint de validación)

**Permisos**: Acceso a Gemini API para procesamiento de imágenes

---

### BANK_ACCOUNT_EC_NAME

**Descripción**: Nombre del titular de la cuenta bancaria de Ecuador

**Formato**: String (nombre completo)

**Ejemplo**:
```env
BANK_ACCOUNT_EC_NAME=Carlos Maldonado
```

**Uso**: Validación de comprobantes de transferencia para verificar que el destinatario coincida

---

### BANK_ACCOUNT_EC_NUMBER

**Descripción**: Número de cuenta bancaria de Ecuador

**Formato**: String numérico

**Ejemplo**:
```env
BANK_ACCOUNT_EC_NUMBER=333444555
```

**Uso**: Validación de comprobantes de transferencia

---

### BANK_ACCOUNT_EC_TYPE

**Descripción**: Tipo de cuenta bancaria de Ecuador

**Formato**: String (Ahorros, Corriente, etc.)

**Ejemplo**:
```env
BANK_ACCOUNT_EC_TYPE=Ahorros
```

**Uso**: Información adicional para validación de comprobantes

---

### BANK_ACCOUNT_EC_ID

**Descripción**: Número de cédula del titular de la cuenta de Ecuador

**Formato**: String numérico (10 dígitos)

**Ejemplo**:
```env
BANK_ACCOUNT_EC_ID=1726037788
```

**Uso**: Validación adicional de identidad del titular

---

### BANK_ACCOUNT_MX_NAME

**Descripción**: Nombre del titular de la cuenta bancaria de México

**Formato**: String (nombre completo)

**Ejemplo**:
```env
BANK_ACCOUNT_MX_NAME=Daniela Briones
```

**Uso**: Validación de comprobantes de transferencia para verificar que el destinatario coincida

---

### BANK_ACCOUNT_MX_CLABE

**Descripción**: CLABE interbancaria de la cuenta de México

**Formato**: String numérico (18 dígitos)

**Ejemplo**:
```env
BANK_ACCOUNT_MX_CLABE=999888777666
```

**Uso**: Validación de comprobantes de transferencia SPEI

---

### NEXT_PUBLIC_BUILDER_API_KEY

**Descripción**: API key pública de Builder.io para visual editing

**Formato**: String alfanumérico (ejemplo: `f1a0b2c3d4e5f6g7h8i9j0k1`)

**Dónde obtenerla**:
1. Ve a [builder.io/account](https://builder.io/account)
2. Selecciona tu Space
3. Account → Space Settings → API Keys
4. Copia "Public API Key"

**Ejemplo**:
```env
NEXT_PUBLIC_BUILDER_API_KEY=f1a0b2c3d4e5f6g7h8i9j0k1l2m3n4o5
```

**⚠️ Seguridad**: Esta variable es **pública**. Builder.io restringe acceso por dominio.

**Usos**:
- Inicialización de Builder.io SDK (`builder.init()`)
- Fetch de contenido de landing page
- Render de componentes visuales editables

**Límites Free Tier**:
- 25,000 requests/mes
- 5 modelos
- 1 usuario editor

---

## Configuración por Entorno

### Desarrollo Local (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Builder.io
NEXT_PUBLIC_BUILDER_API_KEY=f1a0b2c3...
```

**Creación**:
```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

### Vercel Production

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Settings → Environment Variables
4. Agrega cada variable una por una:
   - **Key**: Nombre de la variable (ej: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Valor de la variable
   - **Environment**: Selecciona `Production`, `Preview`, `Development` según necesidad

**Recomendación**: Usa los mismos valores en todos los entornos para simplificar.

### GitHub Actions / CI (Opcional)

Si usas CI/CD, agrega las variables como **secrets**:
1. GitHub Repo → Settings → Secrets and variables → Actions
2. New repository secret
3. Agrega cada variable (excepto las públicas con `NEXT_PUBLIC_`)

---

## Validación

### Script de Validación

Crea un script `scripts/validate-env.ts`:

```typescript
function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_BUILDER_API_KEY',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missing.join(', '))
    process.exit(1)
  }

  console.log('✅ Todas las variables de entorno están configuradas')
}

validateEnv()
```

**Ejecutar**:
```bash
npx tsx scripts/validate-env.ts
```

### Verificación Manual

```bash
# Ver variables (sin valores por seguridad)
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $NEXT_PUBLIC_BUILDER_API_KEY

# ⚠️ NO imprimas SUPABASE_SERVICE_ROLE_KEY en logs públicos
```

---

## Troubleshooting

### Error: "supabaseUrl and supabaseKey are required"

**Causa**: Variables de Supabase no configuradas o mal nombradas

**Solución**:
1. Verifica que `.env.local` existe
2. Verifica los nombres exactos (case-sensitive)
3. Reinicia el dev server (`npm run dev`)

---

### Error: "Builder.io content not loading"

**Causa**: API key inválida o no configurada

**Solución**:
1. Verifica `NEXT_PUBLIC_BUILDER_API_KEY` en `.env.local`
2. Verifica que la key es del Space correcto en Builder.io
3. Verifica que has publicado al menos una página "/" en Builder.io

---

### Error: "RLS policy denying access"

**Causa**: Token no se está pasando correctamente o política RLS mal configurada

**Solución**:
1. Verifica que el token existe en la tabla `guests`
2. Revisa las políticas RLS en Supabase Dashboard → Authentication → Policies
3. Verifica que el cliente está usando la función `set_config` para pasar el token

---

### Variables no se cargan en Vercel

**Causa**: No se configuraron en Vercel dashboard o typo en nombre

**Solución**:
1. Ve a Vercel → Settings → Environment Variables
2. Verifica cada variable está agregada
3. Verifica los valores no tienen espacios extra
4. Redeploy el proyecto (Deployments → ⋯ → Redeploy)

---

## Seguridad Checklist

- [ ] `.env.local` está en `.gitignore`
- [ ] No hay variables hardcodeadas en el código
- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo se usa en scripts/server
- [ ] Todas las variables públicas tienen prefijo `NEXT_PUBLIC_`
- [ ] Credenciales guardadas en password manager seguro
- [ ] Builder.io tiene domain whitelisting configurado (opcional)

---

## Referencias

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api#api-keys)
- [Builder.io API Keys](https://www.builder.io/c/docs/using-your-api-key)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
