# Sistema de Notificaciones por Email - Transacciones Aprobadas

## Descripción

Sistema automático de envío de correos electrónicos cuando una transacción de regalo es aprobada. Los emails se envían en los siguientes escenarios:

1. **Aprobación automática (Payphone)**: Cuando un pago con tarjeta es exitoso
2. **Aprobación automática (Gemini)**: Cuando una transferencia bancaria es validada automáticamente por IA
3. **Aprobación manual (Admin)**: Cuando un administrador aprueba manualmente una transacción en revisión

## Configuración

### Variables de Entorno

Agregar las siguientes variables a tu archivo `.env`:

```bash
# SMTP Configuration (for Email Notifications)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USERNAME=resend
SMTP_PASSWORD=re_cNYrN1ZN_PApzzJfRi27tdCLE2syiyzVM
SMTP_FROM_EMAIL=invitacion@clicktoforever.com
SMTP_FROM_NAME=Carlos & Dany
```

### Dependencias

El sistema usa `nodemailer` para el envío de emails:

```bash
npm install nodemailer @types/nodemailer
```

## Arquitectura

### Archivos Creados/Modificados

1. **`lib/email.ts`** - Servicio principal de envío de emails
   - Función `sendTransactionApprovedEmail()`: Envía el email de confirmación
   - Función `generateEmailHTML()`: Genera el HTML del email con diseño personalizado

2. **`app/api/gifts/send-approval-email/route.ts`** - Endpoint API para envío desde cliente
   - POST endpoint que puede ser llamado desde componentes del cliente
   - Valida que la transacción esté aprobada antes de enviar

3. **Integraciones**:
   - `app/api/gifts/confirm-payment/route.ts` - Payphone (tarjeta)
   - `app/api/gifts/transfer/route.ts` - Validación Gemini (transferencia)
   - `components/admin/transactions/TransactionDetailModal.tsx` - Aprobación manual

## Diseño del Email

El email incluye:

### Estructura Visual
- **Fondo**: Color crema (`#FAF8F3`)
- **Encabezado**: Logo "Carlos & Dany" en verde oscuro
- **Tarjeta principal**: Fondo blanco con bordes redondeados
- **Sección destacada**: Gradiente lavanda-amarillo con borde amarillo

### Contenido

**Asunto**: 🎁 Recibimos tu regalo + Tienes [X] Machi Coins 🦞

**Secciones**:
1. Saludo personalizado con nombre del donante
2. Confirmación del monto recibido
3. Mensaje de agradecimiento
4. **Destacado visual**: Cantidad de Machi Coins (10 monedas por $1)
5. Explicación de uso de las monedas:
   - 🍹 Tragos en la barra
   - 🎶 Pedir canciones al DJ
   - 🎭 Props y sorpresas
   - 🎲 Jugar a la Ruleta de Mónica
6. Botón CTA: "IR A GASTAR MIS COINS (ENTRAR)"
7. Detalles de transacción:
   - ID de transacción
   - Fecha
   - Monto aportado
   - Regalo (si aplica)
8. Firma: "Con cariño, Carlos & Dany"

### Cálculo de Machi Coins

```typescript
const machiCoins = Math.floor(amount * 10);
// $50 USD = 500 Machi Coins
```

### Responsivo

El email es completamente responsive con:
- Diseño optimizado para móviles
- Fuentes legibles en todas las pantallas
- Botones táctiles grandes

## Flujos de Aprobación

### 1. Payphone (Tarjeta de Crédito)

```typescript
// app/api/gifts/confirm-payment/route.ts
const { error: updateError } = await supabase
  .from('gift_transactions')
  .update({ 
    payphone_transaction_id: id,
    status: 'APPROVED'
  })
  .eq('payphone_client_transaction_id', clientTransactionId)
  .eq('status', 'PENDING')

// Email enviado automáticamente después de actualización exitosa
sendTransactionApprovedEmail({...})
```

### 2. Transferencia Bancaria (Gemini AI)

```typescript
// app/api/gifts/transfer/route.ts
async function validateReceiptAsync() {
  const result = await validator.validateReceipt(...)
  
  if (result.validation.isValid) {
    validationStatus = 'APPROVED';
    
    await supabase
      .from('gift_transactions')
      .update({ status: validationStatus, ... })
    
    // Email enviado automáticamente si es APPROVED
    sendTransactionApprovedEmail({...})
  }
}
```

### 3. Aprobación Manual (Admin Panel)

```typescript
// components/admin/transactions/TransactionDetailModal.tsx
async function handleApprove() {
  // 1. Actualizar transacción
  await supabase
    .from('gift_transactions')
    .update({
      status: 'APPROVED',
      amount: amount,
      approved_at: new Date().toISOString(),
    })
  
  // 2. Actualizar gift collected_amount
  await supabase.from('gifts').update({...})
  
  // 3. Enviar email vía API
  await fetch('/api/gifts/send-approval-email', {
    method: 'POST',
    body: JSON.stringify({ transactionId })
  })
}
```

## Manejo de Errores

El sistema está diseñado para NO bloquear el flujo principal si el email falla:

```typescript
sendTransactionApprovedEmail({...})
  .catch((error) => {
    console.error('Error sending approval email:', error)
    // No bloqueamos el flujo si falla el email
  })
```

**Validaciones**:
- ✅ Verifica variables de entorno al inicio
- ✅ Valida que la transacción exista
- ✅ Valida que el estado sea APPROVED antes de enviar
- ✅ Logs detallados para debugging
- ✅ No afecta la transacción principal si falla

## Testing

### Verificar Variables de Entorno

```bash
# Verificar que todas las variables están configuradas
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USERNAME
# etc...
```

### Probar Envío de Email

1. **Test con transacción nueva (Payphone)**:
   - Hacer un pago de prueba con tarjeta
   - Verificar que el email llegue al correo del donante

2. **Test con transferencia bancaria**:
   - Subir comprobante válido
   - Esperar aprobación automática de Gemini
   - Verificar email

3. **Test con aprobación manual**:
   - Ir al Admin Panel
   - Aprobar una transacción en MANUAL_REVIEW
   - Verificar email

### Logs a Revisar

```bash
# En la consola del servidor verás:
Email sent successfully: <message-id>

# En caso de error:
Error sending email: <error-details>
Missing SMTP configuration: SMTP_PASSWORD
```

## Limitaciones del Servidor SMTP

Según la configuración de Resend:

- **Intervalo mínimo por usuario**: 60 segundos
- El sistema respetará este límite automáticamente
- Si se intenta enviar más rápido, Resend rechazará el email

## Troubleshooting

### Email no se envía

1. **Verificar variables de entorno**:
```bash
# Listar todas las variables SMTP
env | grep SMTP
```

2. **Revisar logs del servidor**:
```bash
# Buscar errores de email
pm2 logs | grep "email"
```

3. **Verificar credenciales SMTP**:
   - Probar login con las credenciales en un cliente de email
   - Verificar que el password no haya expirado

4. **Verificar puerto**:
   - Puerto 587: TLS (recomendado)
   - Puerto 465: SSL
   - Evitar puerto 25 (suele estar bloqueado)

### Email llega a spam

Para mejorar la entregabilidad:

1. Configurar registros SPF y DKIM en Resend
2. Verificar el dominio `clicktoforever.com`
3. Usar un dominio personalizado verificado
4. Evitar palabras spam en el asunto/contenido

### Formato incorrecto

El HTML del email usa:
- Tablas para compatibilidad con clientes de email antiguos
- Estilos inline (requerido por muchos clientes)
- Colores hexadecimales directos
- Fuentes seguras y fallbacks

## Futuras Mejoras

- [ ] Template engine (Handlebars, EJS) para mayor flexibilidad
- [ ] Sistema de queue para envíos masivos
- [ ] Retry logic si falla el envío
- [ ] Dashboard para ver emails enviados
- [ ] A/B testing de templates
- [ ] Envío de recordatorios antes del evento
- [ ] Emails de seguimiento post-evento

## Referencias

- [Nodemailer Documentation](https://nodemailer.com/)
- [Resend API Docs](https://resend.com/docs)
- [Email HTML Best Practices](https://www.campaignmonitor.com/css/)
