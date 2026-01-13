import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { id, clientTransactionId } = await request.json()

    console.log('=== PROCESS PAYMENT CONFIRMATION ===')
    console.log('Params:', { id, clientTransactionId })

    if (!clientTransactionId || !id) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the transaction by clientTransactionId
    const { data: transaction, error: findError } = await supabase
      .from('gift_transactions')
      .select('*')
      .eq('payphone_client_transaction_id', clientTransactionId)
      .single()

    if (findError || !transaction) {
      console.error('Transaction not found:', { clientTransactionId, error: findError })
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    console.log('Transaction found:', {
      // @ts-expect-error - Supabase type inference issue
      id: transaction.id,
      // @ts-expect-error - Supabase type inference issue
      status: transaction.status,
      // @ts-expect-error - Supabase type inference issue
      giftId: transaction.gift_id,
    })

    // If already confirmed, return success
    // @ts-expect-error - Supabase type inference issue
    if (transaction.status === 'CONFIRMED') {
      console.log('Transaction already confirmed')
      return NextResponse.json({ success: true, alreadyConfirmed: true })
    }

    // Call PayPhone V2/Confirm endpoint directly
    try {
      const token = process.env.PAYPHONE_TOKEN
      const apiUrl = process.env.PAYPHONE_API_URL || 'https://pay.payphonetodoesposible.com'
      
      if (!token) {
        throw new Error('PAYPHONE_TOKEN not configured')
      }

      // Wait 3 seconds before confirming (PayPhone may need time to process)
      console.log('Waiting 3 seconds before confirmation...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Prepare request body exactly as PayPhone expects
      const body = {
        id: parseInt(id),
        clientTxId: clientTransactionId
      }

      console.log('Calling PayPhone V2/Confirm API...')
      console.log('URL:', `${apiUrl}/api/button/V2/Confirm`)
      console.log('Body:', JSON.stringify(body))
      console.log('Token length:', token.length)

      const response = await fetch(`${apiUrl}/api/button/V2/Confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      console.log('PayPhone response status:', response.status)
      console.log('PayPhone response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('PayPhone API error:', errorText.substring(0, 500))
        throw new Error(`PayPhone API returned ${response.status}`)
      }

      const confirmResult = await response.json()
      console.log('PayPhone confirmation result:', confirmResult)

      if (confirmResult.transactionStatus === 'Approved') {
        // Update transaction as confirmed using RPC
        // @ts-expect-error - Supabase type inference issue
        const { error: updateError } = await supabase.rpc('approve_gift_transaction', {
          // @ts-expect-error - Supabase type inference issue
          p_transaction_id: transaction.id,
        })

        if (updateError) {
          console.error('Failed to approve transaction:', updateError)
          return NextResponse.json(
            { success: false, error: 'Error al actualizar la transacción' },
            { status: 500 }
          )
        }

        console.log('Transaction approved successfully')
        return NextResponse.json({ success: true })
      } else {
        // Payment not approved by PayPhone
        console.log('Payment not approved by PayPhone:', confirmResult.transactionStatus)
        
        // Mark as rejected
        await supabase
          .from('gift_transactions')
          // @ts-expect-error - Supabase type inference issue
          .update({
            status: 'REJECTED',
            payphone_status: confirmResult.transactionStatus,
          })
          // @ts-expect-error - Supabase type inference issue
          .eq('id', transaction.id)

        return NextResponse.json(
          { success: false, error: 'El pago no fue aprobado' },
          { status: 400 }
        )
      }
    } catch (confirmError) {
      console.error('PayPhone confirmation failed:', confirmError)
      
      // Mark transaction as rejected
      await supabase
        .from('gift_transactions')
        // @ts-expect-error - Supabase type inference issue
        .update({
          status: 'REJECTED',
          payphone_status: 'ERROR',
        })
        // @ts-expect-error - Supabase type inference issue
        .eq('id', transaction.id)

      return NextResponse.json(
        { success: false, error: 'Error al confirmar con PayPhone' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Process confirmation error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
