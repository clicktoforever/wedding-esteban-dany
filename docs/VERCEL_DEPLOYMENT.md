# 🚀 Guía de Despliegue en Vercel

## ✅ Código ya en GitHub
Tu repositorio: **https://github.com/clicktoforever/wedding-esteban-dany**
Rama: `feature/v1-civil`

---

## 📋 Pasos para Desplegar en Vercel

### 1. Crear Cuenta en Vercel
1. Ve a https://vercel.com
2. Click en "Sign Up"
3. **Conecta con GitHub** (recomendado)
4. Autoriza a Vercel para acceder a tus repositorios

### 2. Importar Proyecto desde GitHub
1. En Vercel Dashboard, click en **"Add New..."** → **"Project"**
2. Busca tu repositorio: `clicktoforever/wedding-esteban-dany`
3. Click en **"Import"**

### 3. Configurar el Proyecto

#### Framework Preset
- Vercel debería detectar automáticamente: **Next.js**
- Si no, selecciónalo manualmente

#### Root Directory
- Dejar como está: `./` (raíz del proyecto)

#### Build Settings
```
Build Command:        npm run build
Output Directory:     .next
Install Command:      npm install --legacy-peer-deps
```

**⚠️ IMPORTANTE:** En "Install Command", agrega el override:
```bash
npm install --legacy-peer-deps
```

### 4. Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega estas variables una por una:

| Name | Value | Dónde obtenerlo |
|------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://cleeumrziseyvctsfxxx.supabase.co` | Tu archivo .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5c...` | Tu archivo .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5c...` | Tu archivo .env.local |
| `NEXT_PUBLIC_BUILDER_API_KEY` | `7275fb28b3684652a493c6fd6532e314` | Tu archivo .env.local |

**Opcional (si tienes problemas SSL en Vercel):**
| Name | Value |
|------|-------|
| `NODE_TLS_REJECT_UNAUTHORIZED` | `0` |

> ⚠️ **NO** subas el archivo `.env.local` a GitHub - ya está en `.gitignore`

### 5. Desplegar

1. Click en **"Deploy"**
2. Vercel comenzará a:
   - Clonar tu repositorio
   - Instalar dependencias (con `--legacy-peer-deps`)
   - Construir tu aplicación Next.js
   - Desplegar a producción

**Tiempo estimado:** 2-5 minutos

### 6. Obtener tu URL de Producción

Una vez completado:
- URL automática: `https://wedding-esteban-dany-xxxxx.vercel.app`
- Click en "Visit" para ver tu sitio en vivo

---

## 🔧 Configuración Post-Despliegue

### Configurar Dominio Personalizado (Opcional)

1. En tu proyecto Vercel → **Settings** → **Domains**
2. Click en **"Add Domain"**
3. Ingresa tu dominio: `estebanydany.com`
4. Sigue las instrucciones para actualizar DNS:
   - Tipo: `A` → IP de Vercel
   - Tipo: `CNAME` → `cname.vercel-dns.com`

### Configurar Rama de Producción

1. **Settings** → **Git**
2. **Production Branch:** Cambia de `main` a `feature/v1-civil`
3. Guarda cambios

### Habilitar Preview Deployments

- Cada push a cualquier rama creará un preview deployment
- URL temporal: `https://wedding-esteban-dany-git-<branch>.vercel.app`

---

## 🎯 URLs de tu Proyecto

Después del despliegue:

| Página | URL |
|--------|-----|
| **Home** | `https://tu-dominio.vercel.app/` |
| **Confirmación** | `https://tu-dominio.vercel.app/confirm/test_token_carlos_123` |
| **Regalos** | `https://tu-dominio.vercel.app/gifts` |
| **Admin** | `https://tu-dominio.vercel.app/admin` |

---

## 🔄 Flujo de Trabajo Continuo

### Para Actualizar el Sitio en Producción:

```bash
# 1. Hacer cambios en código
# 2. Commit
git add .
git commit -m "feat: descripción de cambios"

# 3. Push a GitHub
git push origin feature/v1-civil

# 4. Vercel detecta el push y redespliega automáticamente (30-60 segundos)
```

### Rollback a Versión Anterior:

1. En Vercel Dashboard → **Deployments**
2. Encuentra el deployment anterior exitoso
3. Click en los 3 puntos → **Promote to Production**

---

## ⚡ Optimizaciones Recomendadas

### 1. Configurar ISR en Vercel

Las páginas ya tienen `revalidate` configurado:
- Landing: cada 60s
- Gifts: cada 10s
- Admin: cada 10s

Vercel lo maneja automáticamente.

### 2. Habilitar Analytics

1. En proyecto Vercel → **Analytics**
2. Click "Enable"
3. Obtén métricas de:
   - Web Vitals (Core Web Vitals)
   - Page views
   - Top pages
   - Traffic sources

### 3. Configurar Security Headers

En `next.config.js` (ya incluido):
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}
```

---

## 🐛 Troubleshooting

### Error: "Module not found: Can't resolve '@builder.io/sdk'"

**Solución:** Ya está configurado el install command con `--legacy-peer-deps`

### Error: "Supabase connection failed"

**Verificar:**
1. Variables de entorno están correctamente configuradas
2. URLs no tienen espacios o caracteres extras
3. Keys de Supabase son las correctas (anon key y service role key)

### Error: "Build failed"

**Pasos:**
1. Verifica que el build funcione localmente: `npm run build`
2. Revisa los logs en Vercel Dashboard
3. Asegúrate que todas las dependencias estén en `package.json`

### La página no actualiza después de cambios

**Soluciones:**
1. Hard refresh: `Ctrl + Shift + R` (o `Cmd + Shift + R` en Mac)
2. Limpiar cache de Vercel: Deployment → Redeploy
3. Verificar que el push llegó a GitHub

---

## 📊 Monitoreo en Producción

### Vercel Dashboard
- **Deployments:** Ver historial de deploys
- **Analytics:** Métricas de tráfico
- **Logs:** Errores en tiempo real
- **Speed Insights:** Performance metrics

### Supabase Dashboard
- **Database:** Ver datos en tiempo real
- **API Logs:** Queries ejecutadas
- **Auth:** (si lo implementas después)

---

## 🎉 ¡Listo!

Tu sitio de boda está:
- ✅ En GitHub (versionado)
- ✅ Desplegado en Vercel (producción)
- ✅ Con HTTPS automático
- ✅ Con CDN global
- ✅ Con auto-deployment en cada push

**Tu sitio estará disponible en:** `https://wedding-esteban-dany-xxxxx.vercel.app`

---

## 📞 Contacto para Invitados

Comparte la URL de confirmación con formato:
```
https://tu-dominio.vercel.app/confirm/TOKEN_UNICO
```

Ejemplo:
```
https://wedding-esteban-dany.vercel.app/confirm/test_token_carlos_123
```

---

**Creado:** 10 de Enero, 2026
**Actualizado:** Automáticamente con cada deploy
