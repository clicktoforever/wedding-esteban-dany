# Configuración del Sistema de Autenticación de Administradores

Este documento explica cómo configurar y usar el sistema de autenticación para el panel de administración.

## 📋 Componentes Implementados

### 1. Layout de Protección (`app/admin/layout.tsx`)
- Protege todas las rutas `/admin/*` (excepto `/admin/login`)
- Verifica que exista una sesión activa en el servidor
- Valida que el usuario sea un administrador autorizado
- Redirige a login si no hay sesión o no es admin
- Compatible con Next.js 15 (sin middleware deprecated)

### 2. Página de Login (`app/admin/login/page.tsx`)
- Formulario de autenticación con email y contraseña
- Validación de credenciales usando Supabase Auth
- Verificación adicional en la tabla `admin_users`
- Diseño coherente con el estilo de la boda

### 3. Tabla de Administradores (`supabase/admin-users-schema.sql`)
- Tabla `admin_users` para gestionar usuarios autorizados
- Row Level Security (RLS) activado
- Políticas que solo permiten acceso a admins existentes

### 4. Botón de Cerrar Sesión (`components/admin/LogoutButton.tsx`)
- Componente client-side para cerrar sesión
- Reemplaza el enlace "Volver" en el panel admin

## 🚀 Configuración Inicial

### Paso 1: Crear la Tabla en Supabase

1. Abre el SQL Editor en tu dashboard de Supabase
2. Ejecuta el contenido del archivo `supabase/admin-users-schema.sql`

### Paso 2: Crear el Primer Usuario Administrador

**Opción A: Desde el Dashboard de Supabase**

1. Ve a **Authentication → Users** en tu dashboard de Supabase
2. Haz clic en **"Add user"** y elige **"Create new user"**
3. Ingresa:
   - Email: tu email de admin
   - Password: una contraseña segura
   - Confirma el email automáticamente (activar toggle)
4. Copia el `user_id` del usuario creado
5. Ve a **SQL Editor** y ejecuta:

```sql
-- Temporalmente deshabilitar RLS para insertar el primer admin
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Insertar el primer admin (reemplaza con tus datos)
INSERT INTO admin_users (user_id, email)
VALUES ('uuid-del-usuario-creado', 'admin@example.com');

-- Re-habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

**Opción B: Desde la API**

```typescript
// Script temporal para crear el primer admin
const supabase = createClient()

// 1. Crear usuario en Auth
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'contraseña-segura',
  email_confirm: true
})

// 2. Obtener el user_id y crear entrada en admin_users manualmente en SQL Editor
console.log('User ID:', authData.user.id)
```

### Paso 3: Agregar Más Administradores (Después del Primero)

Una vez que tengas un admin, puedes agregar más desde SQL Editor:

```sql
-- Como admin existente, puedes insertar nuevos admins
INSERT INTO admin_users (user_id, email)
VALUES ('nuevo-user-id', 'otro-admin@example.com');
```

O crear un endpoint API protegido para gestionar admins.

## 🔐 Flujo de Autenticación

1. Usuario intenta acceder a `/admin`
2. Middleware intercepta la petición
3. Si no hay sesión → redirige a `/admin/login`
4. Usuario ingresa credenciales
5. Sistema verifica contra Supabase Auth
6. Sistema verifica que el user_id exista en `admin_users`
7. Si todo es correcto → acceso concedido
8. Si no es admin → redirige al home

## 🛡️ Seguridad

- **Row Level Security (RLS)**: Solo admins pueden ver/modificar la tabla de admins
- **Middleware**: Protección a nivel de Next.js antes de renderizar
- **Verificación doble**: Auth + tabla de admins
- **Sin enlaces públicos**: Se eliminaron todos los enlaces a `/admin` en la UI pública

## 📝 Acceso al Panel

### URL de Login
```
https://tu-dominio.com/admin/login
```

### Después de Autenticarse
```
https://tu-dominio.com/admin
```

## 🔧 Gestión de Administradores

### Ver Administradores Actuales
```sql
SELECT 
  au.id,
  au.email,
  au.created_at,
  u.email as auth_email
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id;
```

### Agregar Nuevo Administrador
```sql
-- Primero, crear el usuario en Authentication desde el dashboard
-- Luego ejecutar:
INSERT INTO admin_users (user_id, email)
VALUES ('user-id-from-auth', 'email@example.com');
```

### Remover Administrador
```sql
DELETE FROM admin_users
WHERE email = 'admin-a-remover@example.com';
```

## ⚠️ Solución de Problemas

### "No tienes permisos de administrador"
- Verifica que el usuario esté en la tabla `admin_users`
- Confirma que el `user_id` coincida con el de Auth

### Error al crear primer admin por RLS
- Usa el SQL proporcionado que temporalmente deshabilita RLS
- Recuerda re-habilitarlo después

### Redirección infinita al login
- Verifica que el layout de login (`app/admin/login/layout.tsx`) no tenga protección
- Confirma que el usuario esté en la tabla `admin_users`

### Error en createClient
- Asegúrate de usar `createClient()` de `@/lib/supabase/server` en server components
- Usa `createClient()` de `@/lib/supabase/browser` en client components

## 📚 Archivos Modificados

- ✅ `app/admin/layout.tsx` - Layout con protección de rutas
- ✅ `app/admin/login/layout.tsx` - Layout sin protección para login
- ✅ `app/admin/login/page.tsx` - Página de login
- ✅ `app/admin/page.tsx` - Botón de cerrar sesión
- ✅ `components/admin/LogoutButton.tsx` - Componente de logout
- ✅ `supabase/admin-users-schema.sql` - Schema de la tabla
- ✅ `app/gifts/page.tsx` - Eliminado enlace a admin

## 🎯 Próximos Pasos Opcionales

1. **Recuperación de contraseña**: Implementar "Olvidé mi contraseña"
2. **Gestión de admins**: Crear UI para agregar/remover admins
3. **Roles**: Agregar diferentes niveles de permisos
4. **Logs de acceso**: Registrar quién accede y cuándo
5. **2FA**: Autenticación de dos factores para mayor seguridad
