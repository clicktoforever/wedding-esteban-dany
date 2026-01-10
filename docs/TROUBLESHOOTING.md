# 🔧 Troubleshooting Guide

Guía completa para resolver problemas comunes en la aplicación.

## Tabla de Contenidos

- [Problemas con Supabase](#problemas-con-supabase)
- [Problemas con Builder.io](#problemas-con-builderio)
- [Problemas con Next.js](#problemas-con-nextjs)
- [Problemas con Vercel](#problemas-con-vercel)
- [Problemas de Performance](#problemas-de-performance)
- [Problemas de Tipos TypeScript](#problemas-de-tipos-typescript)

---

## Problemas con Supabase

### Error: "Invalid JWT" o "JWT expired"

**Síntomas**:
```
Error: Invalid JWT
FetchError: invalid JWT
```

**Causas posibles**:
1. Anon key incorrecta o copiada mal
2. Service role key usada en cliente (security risk)
3. Proyecto Supabase pausado (free tier inactivo 7 días)

**Soluciones**:

1. **Verificar keys en dashboard**:
   ```bash
   # Compara con tus .env.local
   # Supabase Dashboard → Settings → API
   ```

2. **Regenerar anon key** (si está comprometida):
   - Settings → API → Generate new anon key
   - Actualiza en `.env.local` y Vercel

3. **Reactivar proyecto pausado**:
   - Dashboard → Verás banner "Project paused"
   - Click "Restore project"

---

### Error: "new row violates row-level security policy"

**Síntomas**:
```
Error: new row violates row-level security policy for table "passes"
```

**Causas**:
1. RLS policy mal configurada
2. Token no se está pasando correctamente
3. Intentando insertar/actualizar sin permisos

**Soluciones**:

1. **Revisar RLS policies**:
   ```sql
   -- En Supabase SQL Editor
   SELECT * FROM pg_policies WHERE tablename = 'passes';
   ```

2. **Verificar token en requests**:
   ```typescript
   // En browser client
   const { data, error } = await supabase
     .from('passes')
     .update({ ... })
     .eq('id', passId)
     .eq('guest_id', guestId) // Asegura que guest_id match con token
   ```

3. **Deshabilitar RLS temporalmente para debug** (⚠️ solo en dev):
   ```sql
   ALTER TABLE passes DISABLE ROW LEVEL SECURITY;
   -- Prueba tu query
   ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
   ```

---

### Error: "Connection pooler limit reached"

**Síntomas**:
```
Error: Connection pooler limit reached
Too many connections
```

**Causa**: Free tier Supabase limita a ~10 conexiones simultáneas

**Soluciones**:

1. **Usar connection pooling** (ya configurado):
   ```typescript
   // lib/supabase/server.ts usa @supabase/ssr que maneja pooling
   ```

2. **Evitar queries en loops**:
   ```typescript
   // ❌ Mal
   for (const guest of guests) {
     await supabase.from('passes').select()...
   }

   // ✅ Bien
   const { data } = await supabase
     .from('passes')
     .select()
     .in('guest_id', guestIds)
   ```

3. **Actualizar a plan pagado** si superas 500 invitados

---

## Problemas con Builder.io

### Builder.io content no carga (404 placeholder)

**Síntomas**:
- Landing page muestra "La página está siendo configurada"
- No aparece contenido visual

**Causas**:
1. API key incorrecta
2. No se ha publicado ninguna página "/"
3. ISR cache no ha revalidado

**Soluciones**:

1. **Verificar API key**:
   ```bash
   # .env.local
   NEXT_PUBLIC_BUILDER_API_KEY=tu_key_aqui
   
   # Reiniciar dev server
   npm run dev
   ```

2. **Crear y publicar página**:
   - Builder.io → Content → New → page
   - URL: `/`
   - Agregar componentes
   - Click "Publish" (no solo "Save")

3. **Forzar revalidación**:
   ```bash
   # Agregar ?builder.preview=true a URL
   http://localhost:3000/?builder.preview=true
   
   # O espera 60 segundos (ISR revalidate)
   ```

---

### Custom components no aparecen en Builder.io editor

**Síntomas**:
- WeddingCountdown, GalleryGrid, ConfirmationCTA no están en sidebar

**Causas**:
1. `app/builder-registry.tsx` no se está importando
2. API key no coincide con Space en Builder.io
3. Componentes no registrados correctamente

**Soluciones**:

1. **Verificar import en layout**:
   ```typescript
   // app/layout.tsx
   import './builder-registry' // ✅ Debe estar
   ```

2. **Verificar registration**:
   ```typescript
   // app/builder-registry.tsx
   Builder.registerComponent(WeddingCountdown, {
     name: 'WeddingCountdown', // Nombre que aparece en editor
     inputs: [...]
   })
   ```

3. **Limpiar cache de Builder.io**:
   - Builder.io dashboard
   - Account → Clear cache
   - Refresh editor

---

### Preview URL no funciona

**Síntomas**:
- Editor muestra iframe en blanco
- Preview URL error

**Causas**:
1. Preview URL mal configurada
2. CORS issues
3. Vercel deployment no está live

**Soluciones**:

1. **Configurar Preview URL correctamente**:
   ```
   https://tu-dominio.vercel.app?builder.preview=true
   ```
   
   En Builder.io:
   - Models → page → Settings
   - Preview URL: pegar URL completa
   - Save

2. **Verificar CORS** (Next.js maneja automáticamente):
   ```typescript
   // next.config.js
   // No requiere configuración adicional
   ```

3. **Usar tunnel para preview local**:
   ```bash
   npx ngrok http 3000
   # Copia URL HTTPS y úsala como Preview URL
   ```

---

## Problemas con Next.js

### Error: "Cannot read properties of undefined"

**Síntomas**:
```
TypeError: Cannot read properties of undefined (reading 'map')
```

**Causa**: Data de Supabase es `null` o `undefined`

**Soluciones**:

1. **Usar optional chaining**:
   ```typescript
   // ❌ Mal
   {guests.map(...)}

   // ✅ Bien
   {guests?.map(...) ?? []}
   ```

2. **Validar data antes de usar**:
   ```typescript
   if (!guests || guests.length === 0) {
     return <div>No hay invitados</div>
   }
   ```

---

### Error: "async/await is only valid in async functions"

**Síntomas**:
```
SyntaxError: await is only valid in async functions
```

**Causa**: Usando `await` en función no async o en Client Component

**Soluciones**:

1. **Agregar async a función**:
   ```typescript
   // ✅ Server Component
   export default async function Page() {
     const data = await fetchData()
     return <div>{data}</div>
   }
   ```

2. **Usar useEffect en Client Component**:
   ```typescript
   'use client'
   
   useEffect(() => {
     async function fetchData() {
       const data = await supabase.from('table').select()
       setData(data)
     }
     fetchData()
   }, [])
   ```

---

### Error: "Image is missing required 'src' property"

**Síntomas**:
```
Error: Image with src "undefined" is missing required "src" property
```

**Causa**: `image_url` es `null` en database

**Soluciones**:

1. **Conditional rendering**:
   ```typescript
   {gift.image_url ? (
     <Image src={gift.image_url} ... />
   ) : (
     <div>Placeholder icon</div>
   )}
   ```

2. **Usar placeholder**:
   ```typescript
   <Image 
     src={gift.image_url || '/placeholder.png'}
     alt={gift.name}
   />
   ```

---

## Problemas con Vercel

### Build falla en Vercel pero funciona local

**Síntomas**:
```
Error: Build failed
Type error: ...
```

**Causas**:
1. Variables de entorno no configuradas en Vercel
2. Type errors que TypeScript local ignora
3. Versión de Node diferente

**Soluciones**:

1. **Configurar env vars en Vercel**:
   - Settings → Environment Variables
   - Agregar todas las variables
   - Redeploy

2. **Correr build local**:
   ```bash
   npm run build
   # Verás los mismos errores que Vercel
   ```

3. **Especificar versión Node**:
   ```json
   // package.json
   "engines": {
     "node": "20.x"
   }
   ```

---

### Deployment success pero 500 errors en runtime

**Síntomas**:
- Build exitoso ✅
- Página carga pero muestra error 500

**Causas**:
1. Supabase queries fallan (RLS)
2. Builder.io API calls fallan
3. Variables de entorno incorrectas

**Soluciones**:

1. **Ver logs en tiempo real**:
   - Vercel → Deployments → [tu deployment]
   - Runtime Logs
   - Busca stack traces

2. **Verificar env vars**:
   ```bash
   # Settings → Environment Variables
   # Confirma valores son correctos (sin espacios extra)
   ```

3. **Probar con datos de prueba**:
   ```typescript
   // Temporalmente hardcodea data para aislar problema
   const guests = [{ name: 'Test' }] // ✅ Si funciona, problema es con fetch
   ```

---

## Problemas de Performance

### Landing page tarda > 5 segundos en cargar

**Causas**:
1. Builder.io CDN slow
2. Imágenes sin optimizar
3. Too many components

**Soluciones**:

1. **Usar Next.js Image**:
   ```typescript
   // ✅ Optimiza automáticamente
   <Image src="..." width={800} height={600} />
   ```

2. **Lazy load components**:
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Skeleton />
   })
   ```

3. **Reducir ISR revalidate** (si no necesitas updates frecuentes):
   ```typescript
   export const revalidate = 300 // 5 minutos en vez de 60s
   ```

---

### Admin dashboard lento con muchos invitados

**Causas**:
1. Query trae demasiada data
2. No hay paginación
3. Re-renders innecesarios

**Soluciones**:

1. **Agregar paginación**:
   ```typescript
   const { data } = await supabase
     .from('guests')
     .select('*')
     .range(0, 49) // Primera página (50 items)
   ```

2. **Usar React.memo**:
   ```typescript
   const GuestRow = React.memo(({ guest }) => {
     return <tr>...</tr>
   })
   ```

3. **Server-side filtering**:
   ```typescript
   // En vez de filtrar en cliente
   .eq('confirmation_status', 'confirmed')
   ```

---

## Problemas de Tipos TypeScript

### Error: "Type 'null' is not assignable to type..."

**Síntomas**:
```
Type 'Database['public']['Tables']['guests']['Row'] | null' 
is not assignable to type 'Guest'
```

**Causa**: TypeScript strict mode detecta nulls

**Soluciones**:

1. **Type narrowing**:
   ```typescript
   if (!guest) {
     return notFound()
   }
   
   // Aquí TypeScript sabe que guest no es null
   return <div>{guest.name}</div>
   ```

2. **Non-null assertion** (solo si estás 100% seguro):
   ```typescript
   const guest = data! // Afirma que no es null
   ```

3. **Optional chaining**:
   ```typescript
   <div>{data?.name ?? 'Sin nombre'}</div>
   ```

---

### Error: "Property 'passes' does not exist on type 'Guest'"

**Síntomas**:
```
Property 'passes' does not exist on type 
'Database["public"]["Tables"]["guests"]["Row"]'
```

**Causa**: Tipos generados no incluyen joins

**Soluciones**:

1. **Crear interface extendida**:
   ```typescript
   type Guest = Database['public']['Tables']['guests']['Row']
   type Pass = Database['public']['Tables']['passes']['Row']
   
   interface GuestWithPasses extends Guest {
     passes: Pass[]
   }
   ```

2. **Type assertion**:
   ```typescript
   const guestWithPasses = guest as GuestWithPasses
   ```

---

## Contacto de Soporte

Si ninguna solución funciona:

1. **Check GitHub Issues**: [tu-repo/issues](https://github.com/tu-usuario/wedding-esteban-dany/issues)
2. **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
3. **Next.js Discussions**: [github.com/vercel/next.js/discussions](https://github.com/vercel/next.js/discussions)
4. **Builder.io Forum**: [forum.builder.io](https://forum.builder.io)

---

## Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Builder.io Docs](https://www.builder.io/c/docs)
- [Vercel Docs](https://vercel.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
