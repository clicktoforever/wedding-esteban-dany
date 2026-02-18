import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTransactionApprovedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    console.log('=== CONFIRM PAYMENT CALLBACK ===')
    console.log('All query params:', Object.fromEntries(searchParams.entries()))
    
    const id = searchParams.get('id')
    const clientTransactionId = searchParams.get('clientTransactionId') || 
                                 searchParams.get('clientTransaciontIde') ||
                                 searchParams.get('clientTxId')

    console.log('Extracted params:', { id, clientTransactionId })

    if (!id || !clientTransactionId) {
      console.error('Missing required params')
      return NextResponse.redirect(new URL('/gifts?error=invalid_payment', request.url))
    }

    // Update transaction with PayPhone ID (this will trigger the Edge Function)
    const supabase = await createClient()
    
    // Obtener información de la transacción para mostrar en la página de confirmación
    const { data: transaction } = await supabase
      .from('gift_transactions')
      .select(`
        id,
        donor_name,
        donor_email,
        amount,
        status,
        gift_id,
        created_at,
        gift:gifts (
          name,
          image_url,
          category
        )
      `)
      .eq('payphone_client_transaction_id', clientTransactionId)
      .single() as { 
        data: { 
          id: string;
          donor_name: string;
          donor_email: string;
          amount: number;
          status: string;
          gift_id: string;
          created_at: string;
          gift: {
            name: string;
            image_url: string | null;
            category: string | null;
          } | null;
        } | null 
      }
    
    const { error: updateError } = await supabase
      .from('gift_transactions')
      .update({ 
        payphone_transaction_id: id,
        status: 'APPROVED' // Payphone solo redirige aquí si el pago fue exitoso
      })
      .eq('payphone_client_transaction_id', clientTransactionId)
      .eq('status', 'PENDING')

      
      // Enviar email de confirmación de forma asíncrona
      if (transaction) {
        sendTransactionApprovedEmail({
          donorName: transaction.donor_name,
          donorEmail: transaction.donor_email,
          amount: transaction.amount,
          transactionId: transaction.id,
          transactionDate: transaction.created_at,
          giftName: transaction.gift?.name,
          giftImage: transaction.gift?.image_url || undefined,
        }).catch((error) => {
          console.error('Error sending approval email:', error)
          // No bloqueamos el flujo si falla el email
        })
      }
    if (updateError) {
      console.error('Error updating transaction:', updateError)
    } else {
      console.log('Transaction updated with PayPhone ID:', id, '- Status: APPROVED')
    }

    // Redirect to confirmation page with all details
    const redirectUrl = new URL('/confirm-payment', request.url)
    redirectUrl.searchParams.set('clientTransactionId', clientTransactionId)
    redirectUrl.searchParams.set('type', 'payphone')
    redirectUrl.searchParams.set('transactionId', transaction?.id || '')
    redirectUrl.searchParams.set('status', 'approved') // Payphone exitoso = aprobado
    
    if (transaction?.donor_name) {
      redirectUrl.searchParams.set('donorName', transaction.donor_name)
    }
    if (transaction?.amount) {
      redirectUrl.searchParams.set('amount', `$${transaction.amount.toFixed(2)} USD`)
    }
    if (transaction?.gift?.name) {
      redirectUrl.searchParams.set('giftName', transaction.gift.name)
    }
    if (transaction?.gift?.image_url) {
      redirectUrl.searchParams.set('giftImage', transaction.gift.image_url)
    }
    
    console.log('Redirecting to:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Confirm payment callback error:', error)
    return NextResponse.redirect(new URL('/gifts?error=processing_error', request.url))
  }
}
