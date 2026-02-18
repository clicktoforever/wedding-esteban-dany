# 🚀 Guía Rápida: Implementación de Transferencias Bancarias

## ⚡ Setup en 5 Minutos

### 1️⃣ Instalar Dependencia

```bash
npm install @google/generative-ai
```

### 2️⃣ Obtener API Key de Gemini (GRATIS)

1. Ve a: https://aistudio.google.com/app/apikey
2. Inicia sesión con Google
3. Click en "Create API Key"
4. Copia la clave

### 3️⃣ Configurar Variables de Entorno

Crea o edita `.env.local`:

```env
# Agregar esta línea
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4️⃣ Crear Tabla en Supabase

1. Ve a Supabase Dashboard → SQL Editor
2. Copia y ejecuta: `supabase/add-transfer-support.sql`

Esta migración agrega las columnas necesarias a `gift_transactions` sin afectar datos existentes.

### 5️⃣ Configurar Storage Bucket

```sql
-- Ejecutar en Supabase SQL Editor

-- Crear bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-assets', 'wedding-assets', true);

-- Permitir uploads
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'wedding-assets');

-- Permitir lectura
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wedding-assets');
```

### 6️⃣ Actualizar Datos Bancarios (Opcional)

Edita `lib/gemini-receipt-validator.ts` líneas 42-57 con tus datos reales:

```typescript
private readonly bankAccounts = {
  EC: {
    accountName: 'TU NOMBRE',
    accountNumber: 'TU CUENTA',
    identificationNumber: 'TU CÉDULA',
    // ...
  },
  MX: {
    accountName: 'TU NOMBRE',
    accountNumber: 'TU CLABE',
    // ...
  }
};
```

### 7️⃣ Iniciar Desarrollo

```bash
npm run dev
```

Visita: http://localhost:3000/gifts

## ✅ Verificar Instalación

### Test 1: Ver Modal de Bienvenida
- Abre http://localhost:3000/gifts
- Debes ver modal con 3 métodos de pago
- Click "Entendido"

### Test 2: Seleccionar Regalo
- Click en "Aportar" en cualquier regalo
- Debes ver opciones: Tarjeta, Transfer EC, Transfer MX

### Test 3: Ver Datos Bancarios
```bash
curl http://localhost:3000/api/gifts/bank-accounts?country=EC
```

Debes recibir:
```json
{
  "success": true,
  "account": {
    "country": "EC",
    "bankName": "Banco Pichincha",
    "accountName": "Carlos Maldonado",
    // ...
  }
}
```

### Test 4: Probar Upload (opcional)
1. Selecciona Transfer Ecuador o México
2. Llena el formulario
3. Sube una foto de comprobante de prueba
4. Click "Enviar para Validación"
5. Debes ver: "Tu comprobante está siendo validado..."

## 🎯 Siguiente Paso

Ver documentación completa en:
- [BANK_TRANSFER_SETUP.md](./BANK_TRANSFER_SETUP.md) - Arquitectura y detalles técnicos
- [ENV_VARS.md](./ENV_VARS.md) - Variables de entorno

## 🐛 Problemas Comunes

### "GEMINI_API_KEY is required"
```bash
# Verificar variable existe
cat .env.local | grep GEMINI

# Si no existe, agregarla
echo "GEMINI_API_KEY=tu_key_aqui" >> .env.local

# Reiniciar servidor
npm run dev
```

### "Bucket not found"
```sql
-- Crear bucket en Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-assets', 'wedding-assets', true);
```

### "contributions table does not exist"
```bash
# Ejecutar migración en Supabase SQL Editor
cat supabase/add-transfer-support.sql
# Copiar contenido y ejecutar en SQL Editor
```

## 💰 Costos

- **Gemini API**: GRATIS (1,500 requests/día)
- **Supabase Storage**: GRATIS (1GB)
- **Total para 100 personas**: $0 🎉

## 📞 Ayuda

Si tienes problemas:
1. Revisa logs en la consola del navegador
2. Revisa logs en la terminal (npm run dev)
3. Verifica en Supabase Dashboard → Storage que el bucket existe
4. Verifica en Supabase Dashboard → Table Editor que `gift_transactions` tiene las nuevas columnas

---

**¡Listo! Ya tienes transferencias con IA funcionando** ✨
