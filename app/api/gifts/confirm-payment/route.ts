import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmPayPhonePayment, formatCurrency } from '@/lib/payphone'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientTransactionId = searchParams.get('clientTransactionId') // PayPhone client transaction ID
    const id = searchParams.get('id') // PayPhone transaction ID (from callback)

    console.log('Confirm payment params from PayPhone callback:', { clientTransactionId, id })

    if (!clientTransactionId || !id) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Pago Inválido</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; margin-bottom: 20px; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            a { display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 4px; }
            a:hover { background: #0d5c53; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error en la Transacción</h1>
            <p>Faltan parámetros requeridos para confirmar el pago.</p>
            <a href="/gifts">Volver a Mesa de Regalos</a>
          </div>
        </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      )
    }

    const supabase = await createClient()

    // Get transaction record by clientTransactionId
    const txResult = await supabase
      .from('gift_transactions')
      .select('*, gifts(*)')
      .eq('payphone_client_transaction_id', clientTransactionId)
      .single()

    const transaction = txResult.data as {
      id: string
      gift_id: string
      amount: number
      donor_name: string
      donor_email: string
      payphone_transaction_id: string | null
      status: 'PENDING' | 'APPROVED' | 'REJECTED'
      created_at: string
      gifts: any
    } | null

    if (txResult.error || !transaction) {
      console.error('Transaction not found:', txResult.error)
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Transacción No Encontrada</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; margin-bottom: 20px; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            a { display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 4px; }
            a:hover { background: #0d5c53; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Transacción No Encontrada</h1>
            <p>No se pudo encontrar el registro de la transacción.</p>
            <a href="/gifts">Volver a Mesa de Regalos</a>
          </div>
        </body>
        </html>
        `,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Check if already approved
    if (transaction.status === 'APPROVED') {
      const gift = transaction.gifts as any
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Ya Confirmado</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #059669; margin-bottom: 20px; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            .amount { font-size: 2em; color: #0f766e; font-weight: bold; margin: 20px 0; }
            a { display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }
            a:hover { background: #0d5c53; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Pago Ya Confirmado</h1>
            <p>Esta transacción ya fue procesada anteriormente.</p>
            <div class="amount">${formatCurrency(transaction.amount)}</div>
            <p><strong>Regalo:</strong> ${gift?.name || 'N/A'}</p>
            <p><strong>Donante:</strong> ${transaction.donor_name}</p>
            <a href="/gifts">Ver Mesa de Regalos</a>
          </div>
        </body>
        </html>
        `,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Confirm payment with PayPhone using the ID from callback
    console.log('Confirming payment with PayPhone ID:', id)

    let confirmationResponse
    try {
      console.log('Calling confirmPayPhonePayment with:', { id, clientTransactionId })
      confirmationResponse = await confirmPayPhonePayment(id, clientTransactionId)
    } catch (error) {
      console.error('PayPhone confirmation error:', error)
      
      // Update transaction to REJECTED
      await supabase
        .from('gift_transactions')
        // @ts-expect-error - Supabase type inference issue with joins
        .update({ status: 'REJECTED' })
        .eq('id', transaction.id)

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error en la Confirmación</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; margin-bottom: 20px; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            a { display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 4px; }
            a:hover { background: #0d5c53; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error al Confirmar el Pago</h1>
            <p>Hubo un problema al confirmar tu pago con PayPhone. Por favor contacta al soporte.</p>
            <a href="/gifts">Volver a Mesa de Regalos</a>
          </div>
        </body>
        </html>
        `,
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Check payment status
    if (confirmationResponse.transactionStatus === 'Approved') {
      // Call stored procedure to approve transaction atomically
      const rpcClient = await createClient()
      const rpcResult = await rpcClient
        // @ts-expect-error - Supabase type inference issue with RPC functions
        .rpc('approve_gift_transaction', { transaction_id: transaction.id })
      
      const approvalResult = rpcResult.data as {
        success: boolean
        error?: string
        new_collected_amount: number
        total_amount: number
        is_completed: boolean
      } | null
      const approvalError = rpcResult.error

      if (approvalError || !approvalResult || !approvalResult.success) {
        console.error('Error approving transaction:', approvalError || approvalResult)
        
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error - No Se Pudo Procesar</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              h1 { color: #dc2626; margin-bottom: 20px; }
              p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
              a { display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 4px; }
              a:hover { background: #0d5c53; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Error al Procesar Contribución</h1>
              <p>${approvalResult?.error || 'No se pudo procesar la contribución. El monto puede exceder el saldo disponible.'}</p>
              <a href="/gifts">Volver a Mesa de Regalos</a>
            </div>
          </body>
          </html>
          `,
          { status: 400, headers: { 'Content-Type': 'text/html' } }
        )
      }

      const gift = transaction.gifts as any
      
      // Success! Render success page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>¡Pago Exitoso! 💝</title>
          <style>
            body { 
              font-family: 'Georgia', serif; 
              text-align: center; 
              padding: 50px 20px; 
              background: linear-gradient(135deg, #fef3f2 0%, #faf5ff 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              padding: 50px 40px; 
              border-radius: 16px; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .icon { font-size: 80px; margin-bottom: 20px; }
            h1 { 
              color: #0f766e; 
              margin-bottom: 15px; 
              font-size: 2.5em;
              font-weight: 400;
            }
            .subtitle {
              color: #6b7280;
              font-size: 1.1em;
              margin-bottom: 40px;
              font-style: italic;
            }
            .amount { 
              font-size: 3em; 
              color: #0f766e; 
              font-weight: bold; 
              margin: 30px 0; 
            }
            .details {
              background: #f9fafb;
              padding: 25px;
              border-radius: 8px;
              margin: 30px 0;
              text-align: left;
            }
            .details p {
              margin: 10px 0;
              color: #374151;
              line-height: 1.8;
            }
            .details strong {
              color: #0f766e;
              display: inline-block;
              min-width: 120px;
            }
            .progress-bar {
              background: #e5e7eb;
              height: 20px;
              border-radius: 10px;
              overflow: hidden;
              margin: 20px 0;
            }
            .progress-fill {
              background: linear-gradient(90deg, #0f766e 0%, #059669 100%);
              height: 100%;
              transition: width 0.5s ease;
            }
            .buttons {
              margin-top: 40px;
              display: flex;
              gap: 15px;
              justify-content: center;
              flex-wrap: wrap;
            }
            a { 
              display: inline-block; 
              padding: 15px 30px; 
              background: #0f766e; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px;
              font-weight: 500;
              transition: all 0.3s ease;
            }
            a:hover { 
              background: #0d5c53;
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(15, 118, 110, 0.3);
            }
            a.secondary {
              background: transparent;
              border: 2px solid #0f766e;
              color: #0f766e;
            }
            a.secondary:hover {
              background: #f0fdfa;
              transform: translateY(-2px);
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">💝</div>
            <h1>¡Contribución Exitosa!</h1>
            <p class="subtitle">Tu generosidad significa mucho para nosotros</p>
            
            <div class="amount">${formatCurrency(transaction.amount)}</div>
            
            <div class="details">
              <p><strong>Regalo:</strong> ${gift?.name || 'N/A'}</p>
              <p><strong>Donante:</strong> ${transaction.donor_name}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-EC', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>ID Transacción:</strong> ${confirmationResponse.transactionId || 'N/A'}</p>
            </div>

            ${approvalResult.is_completed ? `
              <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #065f46; font-weight: bold; margin: 0;">
                  🎉 ¡Este regalo ha sido completamente financiado!
                </p>
              </div>
            ` : `
              <div class="divider"></div>
              <p style="color: #6b7280; margin-bottom: 10px;">
                Progreso del regalo: ${formatCurrency(approvalResult.new_collected_amount)} de ${formatCurrency(approvalResult.total_amount)}
              </p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min((approvalResult.new_collected_amount / approvalResult.total_amount) * 100, 100)}%"></div>
              </div>
            `}
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; line-height: 1.8; margin: 30px 0;">
              Gracias por ser parte de nuestro día especial. Tu contribución nos ayuda a comenzar nuestra nueva vida juntos. ¡Nos vemos en la boda!
            </p>
            
            <div class="buttons">
              <a href="/gifts">Ver Mesa de Regalos</a>
              <a href="/" class="secondary">Ir al Inicio</a>
            </div>
          </div>
        </body>
        </html>
        `,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      )
    } else {
      // Payment was not approved (Cancelled, Rejected, Pending)
      await supabase
        .from('gift_transactions')
        // @ts-expect-error - Supabase type inference issue with joins
        .update({ 
          status: confirmationResponse.transactionStatus === 'Cancelled' ? 'REJECTED' : 'PENDING'
        })
        .eq('id', txId)

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago No Completado</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; margin-bottom: 20px; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            .status { 
              padding: 15px; 
              background: #fef2f2; 
              border: 1px solid #fecaca; 
              border-radius: 4px; 
              margin: 20px 0;
              color: #991b1b;
            }
            a { display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }
            a:hover { background: #0d5c53; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Pago No Completado</h1>
            <div class="status">
              <strong>Estado:</strong> ${confirmationResponse.transactionStatus}<br>
              <strong>Detalle:</strong> ${confirmationResponse.statusDetail || 'N/A'}
            </div>
            <p>Tu pago no pudo ser procesado. Puedes intentar nuevamente o elegir otro método de pago.</p>
            <a href="/gifts">Volver a Mesa de Regalos</a>
          </div>
        </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      )
    }

  } catch (error) {
    console.error('Error in confirm-payment endpoint:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error del Servidor</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          h1 { color: #dc2626; margin-bottom: 20px; }
          p { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
          a { display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 4px; }
          a:hover { background: #0d5c53; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error del Servidor</h1>
          <p>Ocurrió un error inesperado. Por favor contacta al soporte.</p>
          <p style="font-size: 0.9em; color: #9ca3af;">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <a href="/gifts">Volver a Mesa de Regalos</a>
        </div>
      </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
}
