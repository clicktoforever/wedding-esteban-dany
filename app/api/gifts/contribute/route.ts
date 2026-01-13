import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
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
    const giftResult = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single()

    const gift = giftResult.data as {
      id: string
      name: string
      price: number | null
      total_amount: number | null
      collected_amount: number | null
      is_crowdfunding: boolean | null
      status: string
    } | null
    
    if (giftResult.error || !gift) {
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
        // @ts-expect-error - Supabase type inference issue
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
    const transactionResult = await supabase
      .from('gift_transactions')
      // @ts-expect-error - Supabase type inference issue
      .insert({
        gift_id: giftId,
        donor_name: donorName,
        amount: amount,
        status: 'PENDING',
        payphone_client_transaction_id: clientTransactionId,
      })
      .select()
      .single()

    const transaction = transactionResult.data as { id: string } | null

    if (transactionResult.error || !transaction) {
      console.error('Error creating transaction:', transactionResult.error)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Prepare PayPhone widget data
    // El monto en PayPhone debe estar en centavos y sin decimales
    const amountInCents = Math.round(amount * 100)

    // Return data for PayPhone widget
    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      paymentConfig: {
        token: process.env.PAYPHONE_TOKEN || '',
        clientTxId: clientTransactionId,
        amount: amountInCents,
        amountWithoutTax: amountInCents,
        currency: 'USD',
        storeId: process.env.PAYPHONE_STORE_ID || '',
        reference: `Regalo: ${gift.name} - ${donorName}`,
      },
      message: 'Transaction created successfully',
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
