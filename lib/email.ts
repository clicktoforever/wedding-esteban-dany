import nodemailer from 'nodemailer';

interface TransactionEmailData {
  donorName: string;
  donorEmail: string;
  amount: number;
  transactionId: string;
  transactionDate: string;
  giftName?: string;
  giftImage?: string;
}

/**
 * Envía un correo de confirmación cuando una transacción es aprobada
 */
export async function sendTransactionApprovedEmail(data: TransactionEmailData): Promise<void> {
  try {
    // Validar variables de entorno
    const requiredEnvVars = [
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USERNAME',
      'SMTP_PASSWORD',
      'SMTP_FROM_EMAIL',
      'SMTP_FROM_NAME',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.warn('⚠️ Email notification skipped - Missing SMTP environment variables:', missingVars.join(', '));
      console.warn('💡 Add SMTP variables to .env.local to enable email notifications');
      return; // Retornar silenciosamente sin bloquear el flujo
    }

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT!, 10),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USERNAME!,
        pass: process.env.SMTP_PASSWORD!,
      },
    });

    // Calcular Machi Coins (10 monedas por cada $1)
    const machiCoins = Math.floor(data.amount * 10);

    // App URL base
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clicktoforever.com';

    // Generar HTML del correo con diseño hermoso
    const htmlContent = generateEmailHTML(data, machiCoins, appUrl);

    // Enviar email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: data.donorEmail,
      subject: '✅ Tu regalo fue aprobado ¡Gracias!',
      html: htmlContent,
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    // No lanzamos el error para no afectar la transacción principal
    // pero lo registramos para debugging
  }
}

/**
 * Genera el HTML del correo con el diseño especificado
 */
function generateEmailHTML(data: TransactionEmailData, machiCoins: number, appUrl: string): string {
  // Colores del tema (basados en Tailwind y tu paleta)
  const colors = {
    cream: '#FAF8F3',
    darkGreen: '#2D5038',
    lavender: '#C5B4E3',
    yellow: '#F6B93B',
    white: '#FFFFFF',
    textDark: '#1F2937',
    textGray: '#6B7280',
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Confirmación de Regalo</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: ${colors.cream};
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0 10px 0;
    }
    .logo-image {
      max-width: 120px;
      height: auto;
      margin: 0 auto 15px auto;
      display: block;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: ${colors.darkGreen};
      margin: 0 0 15px 0;
      font-family: Georgia, serif;
    }
    .card {
      background-color: ${colors.white};
      border-radius: 16px;
      padding: 40px 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      margin-top: 20px;
    }
    .greeting {
      font-size: 24px;
      color: ${colors.textDark};
      margin: 0 0 20px 0;
      font-weight: 600;
    }
    .message {
      color: ${colors.textGray};
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    .highlight-box {
      background-color: #E8F5E9;
      border-radius: 12px;
      padding: 20px 25px;
      margin: 25px 0;
      text-align: center;
      border: 2px solid ${colors.darkGreen};
    }
    .highlight-title {
      font-size: 20px;
      color: ${colors.darkGreen};
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }
    .coins-amount {
      font-size: 42px;
      font-weight: bold;
      color: ${colors.darkGreen};
      margin: 8px 0 5px 0;
    }
    .coins-label {
      font-size: 13px;
      color: ${colors.textGray};
      margin: 0;
      font-weight: 500;
    }
    .info-text {
      color: ${colors.textGray};
      font-size: 15px;
      line-height: 1.7;
      margin: 20px 0;
    }
    .features-list {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    .features-list li {
      padding: 10px 0;
      color: ${colors.textGray};
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      background-color: ${colors.darkGreen};
      color: ${colors.white};
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 700;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(45, 80, 56, 0.3);
      transition: all 0.3s;
    }
    .cta-button:hover {
      background-color: #234029;
      transform: translateY(-2px);
    }
    .transaction-details {
      background-color: ${colors.cream};
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      border-left: 4px solid ${colors.darkGreen};
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: ${colors.textGray};
      font-size: 14px;
      font-weight: 500;
    }
    .detail-value {
      color: ${colors.textDark};
      font-size: 14px;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: ${colors.textGray};
      font-size: 14px;
    }
    .signature {
      font-family: 'Brush Script MT', cursive;
      font-size: 24px;
      color: ${colors.darkGreen};
      margin-top: 30px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px 10px;
      }
      .card {
        padding: 30px 20px;
      }
      .coins-amount {
        font-size: 36px;
      }
      .cta-button {
        padding: 16px 30px;
        font-size: 16px;
      }
    }
    @media (prefers-color-scheme: dark) {
      .cta-button, .cta-text {
        color: #000000 !important;
      }
    }
    [data-ogsc] .cta-button, [data-ogsc] .cta-text {
      color: #000000 !important;
    }
  </style>
</head>
<body>
  <!-- Preheader: Texto que aparece en notificaciones push de Gmail, Outlook, iOS, etc. -->
  <div style="display:none; max-height:0px; overflow:hidden;">
    ...y tienes ${machiCoins} Machi Coins listas para usar en la Party Store ☕
  </div>
  <!-- Espaciador invisible para evitar que se muestre contenido adicional del email -->
  <div style="display:none; max-height:0px; overflow:hidden;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="https://res.cloudinary.com/machiboda/image/upload/f_auto,q_auto/v1772050840/wedding/sqf54cbchcmxljt8gt5a.png" alt="Logo" class="logo-image" />
      <h1 class="logo">Carlos & Dany</h1>
    </div>

    <!-- Main Card -->
    <div class="card">
      <!-- Greeting -->
      <h2 class="greeting">¡Hola, ${data.donorName}! 👋</h2>

      <!-- Confirmation Message -->
      <p class="message">
        Queremos confirmarte que hemos recibido tu aporte de <strong>$${data.amount.toFixed(2)} USD</strong> correctamente.
      </p>
      <p class="message">
        Gracias de todo corazón por ayudarnos a construir nuestros sueños y ser parte de este nuevo capítulo. 
        Tu generosidad significa el mundo para nosotros. ❤️
      </p>

      <!-- Transition -->
      <p class="message" style="margin-top: 30px; font-weight: 600; color: ${colors.textDark};">
        Pero espera... ¡Porque los amigos están para esto! 🦞
      </p>
      <p class="message">
        Queremos que tú también disfrutes tu regalo. Por eso, lo hemos convertido en monedas para que la fiesta vaya por nuestra cuenta.
      </p>

      <!-- Highlight Box - Machi Coins -->
      <div class="highlight-box">
        <p class="highlight-title">¡Ganaste!</p>
        <div class="coins-amount">${machiCoins}</div>
        <p class="coins-label">Machi Coins</p>
        <p style="margin-top: 10px; font-size: 12px; color: ${colors.textGray}; opacity: 0.8;">
          $1 USD aportado = 10 Machi Coins
        </p>
      </div>

      <!-- Info Section -->
      <p class="info-text" style="font-weight: 600; color: ${colors.textDark};">
        ¿Para qué sirven?
      </p>
      <p class="info-text">
        Úsalas en nuestra <strong>Party Store</strong> (la App de la fiesta) para canjear:
      </p>

      <ul class="features-list">
        <li>🍹 <strong>Tragos en la barra</strong></li>
        <li>🎶 <strong>Pedir canciones al DJ</strong></li>
        <li>🎭 <strong>Props y sorpresas</strong></li>
        <li>🎲 <strong>Prueba tu suerte</strong></li>
      </ul>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="https://machiboda.clicktoforever.com" class="cta-button" style="color: #FFFFFF; text-decoration: none;">
          <span class="cta-text" style="color: #FFFFFF;">IR A GASTAR MIS COINS ENTRAR ➔</span>
        </a>
      </div>

      <p class="info-text" style="text-align: center; font-size: 14px;">
        Accede ahora y empieza a llenar tu carrito antes de la fiesta.
      </p>

      <!-- Transaction Details -->
      <div class="transaction-details">
        <div class="detail-row">
          <span class="detail-label">ID de Transacción:</span>
          <span class="detail-value">#${data.transactionId.substring(0, 8).toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">${formatDate(data.transactionDate)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Monto Aportado:</span>
          <span class="detail-value">$${data.amount.toFixed(2)} USD</span>
        </div>
        ${data.giftName ? `
        <div class="detail-row">
          <span class="detail-label">Regalo:</span>
          <span class="detail-value">${data.giftName}</span>
        </div>
        ` : ''}
      </div>

      <!-- Signature -->
      <div style="text-align: center;">
        <p class="signature">Con cariño,<br>Carlos & Dany</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
      <p style="margin-top: 10px;">
        Si tienes alguna pregunta, contáctanos directamente.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Formatea la fecha en formato legible en español
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Guayaquil',
  };
  return date.toLocaleDateString('es-ES', options);
}
