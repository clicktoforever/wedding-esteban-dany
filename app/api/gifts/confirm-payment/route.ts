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
    
    // Solo actualizamos el payphone_transaction_id
    // El trigger de la BD llamará a la Edge Function que confirma con PayPhone
    const { error: updateError } = await supabase
      .from('gift_transactions')
      .update({ 
        payphone_transaction_id: id
        // NO cambiamos el status aquí - lo hace la Edge Function después de confirmar
      })
      .eq('payphone_client_transaction_id', clientTransactionId)
      .eq('status', 'PENDING')

    if (updateError) {
      console.error('Error updating transaction:', updateError)
    } else {
      console.log('Transaction updated with PayPhone ID:', id, '- Trigger will confirm with PayPhone API')
    }

    // Redirect to confirmation page with processing status
    // La Edge Function confirmará con PayPhone en segundo plano
    const redirectUrl = new URL('/confirm-payment', request.url)
    redirectUrl.searchParams.set('clientTransactionId', clientTransactionId)
    redirectUrl.searchParams.set('type', 'payphone')
    redirectUrl.searchParams.set('transactionId', transaction?.id || '')
    redirectUrl.searchParams.set('status', 'review') // Mostrar estado de procesamiento
    
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
