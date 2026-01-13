import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    
    const { error: updateError } = await supabase
      .from('gift_transactions')
      // @ts-expect-error - Supabase type inference issue
      .update({ 
        payphone_transaction_id: id,
      })
      .eq('payphone_client_transaction_id', clientTransactionId)
      .eq('status', 'PENDING')

    if (updateError) {
      console.error('Error updating transaction:', updateError)
    } else {
      console.log('Transaction updated with PayPhone ID:', id)
    }

    // Redirect to thank you page
    const redirectUrl = new URL('/confirm-payment', request.url)
    redirectUrl.searchParams.set('clientTransactionId', clientTransactionId)
    
    console.log('Redirecting to:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Confirm payment callback error:', error)
    return NextResponse.redirect(new URL('/gifts?error=processing_error', request.url))
  }
}
