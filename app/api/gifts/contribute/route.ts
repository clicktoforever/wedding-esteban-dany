import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createPayPhonePayment,
  preparePayPhonePayment,
  generateClientTransactionId,
  formatCurrency,
} from '@/lib/payphone'

export const dynamic = 'force-dynamic'

interface ContributeRequest {
  giftId: string
  donorName: string
  amount: number
  donorEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContributeRequest = await request.json()
    const { giftId, donorName, amount, donorEmail } = body

    // Validate input
    if (!giftId || !donorName || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get gift with row lock to prevent race conditions
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single()

    if (giftError || !gift) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      )
    }

    // Auto-enable crowdfunding if not set and has price
    const giftTotal = gift.total_amount || gift.price || 0
    const giftCollected = gift.collected_amount || 0
    
    if (giftTotal <= 0) {
      return NextResponse.json(
        { error: 'Gift does not have a valid price' },
        { status: 400 }
      )
    }

    // If gift is not crowdfunding yet, enable it with current price
    if (!gift.is_crowdfunding && gift.price) {
      await supabase
        .from('gifts')
        .update({
          is_crowdfunding: true,
          total_amount: gift.price,
          collected_amount: 0,
          status: 'AVAILABLE'
        })
        .eq('id', giftId)
    }

    // Validate gift is not already completed
    if (gift.status === 'COMPLETED' || giftCollected >= giftTotal) {
      return NextResponse.json(
        { error: 'This gift has already been fully funded' },
        { status: 400 }
      )
    }

    // Calculate remaining amount
    const remainingAmount = giftTotal - giftCollected

    // Validate contribution amount
    if (amount > remainingAmount) {
      return NextResponse.json(
        {
          error: `Amount exceeds remaining balance. Remaining: ${formatCurrency(remainingAmount)}`,
          remainingAmount,
        },
        { status: 400 }
      )
    }

    // Generate unique client transaction ID
    const clientTransactionId = generateClientTransactionId(giftId)

    // Create transaction record with PENDING status
    const { data: transaction, error: transactionError } = await supabase
      .from('gift_transactions')
      .insert({
        gift_id: giftId,
        donor_name: donorName,
        amount: amount,
        status: 'PENDING',
        payphone_client_transaction_id: clientTransactionId,
      })
      .select()
      .single()

    if (transactionError || !transaction) {
      console.error('Error creating transaction:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Prepare PayPhone payment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const paymentRequest = createPayPhonePayment({
      amount,
      donorName,
      donorEmail,
      clientTransactionId,
      reference: `Contribución para: ${gift.name}`,
      responseUrl: `${baseUrl}/api/gifts/confirm-payment?txId=${transaction.id}&clientTxId=${clientTransactionId}`,
      cancellationUrl: `${baseUrl}/gifts?cancelled=true`,
    })

    // Call PayPhone API
    const paymentResponse = await preparePayPhonePayment(paymentRequest)

    if (!paymentResponse.payWithPhone) {
      console.error('PayPhone API error:', paymentResponse)
      
      // Update transaction to REJECTED
      await supabase
        .from('gift_transactions')
        .update({ status: 'REJECTED' })
        .eq('id', transaction.id)

      return NextResponse.json(
        { 
          error: paymentResponse.message || 'Failed to create payment',
          details: paymentResponse 
        },
        { status: 500 }
      )
    }

    // Update transaction with PayPhone data
    await supabase
      .from('gift_transactions')
      .update({
        payment_url: paymentResponse.payWithPhone,
        payphone_transaction_id: paymentResponse.transactionId,
        external_transaction_id: paymentResponse.transactionId,
      })
      .eq('id', transaction.id)

    // Return payment URL for redirection
    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      paymentUrl: paymentResponse.payWithPhone,
      clientTransactionId,
      message: 'Payment prepared successfully',
    })

  } catch (error) {
    console.error('Error in contribute endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
