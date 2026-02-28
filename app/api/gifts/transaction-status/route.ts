import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transactionId = searchParams.get('id')
    const clientTransactionId = searchParams.get('clientTransactionId')

    if (!transactionId && !clientTransactionId) {
      return NextResponse.json(
        { error: 'Missing transaction id or clientTransactionId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build query based on which parameter was provided
    let query = supabase
      .from('gift_transactions')
      .select(`
        id,
        donor_name,
        amount,
        status,
        message,
        created_at,
        gift:gifts (
          id,
          name,
          image_url,
          category
        )
      `)
    
    if (transactionId) {
      query = query.eq('id', transactionId)
    } else if (clientTransactionId) {
      query = query.eq('payphone_client_transaction_id', clientTransactionId)
    }

    const { data: transaction, error } = await query.single() as {
      data: {
        id: string;
        donor_name: string;
        amount: number;
        status: string;
        message: string | null;
        created_at: string;
        gift: {
          id: string;
          name: string;
          image_url: string | null;
          category: string | null;
        } | null;
      } | null;
      error: any;
    }

    if (error || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        donorName: transaction.donor_name,
        amount: transaction.amount,
        status: transaction.status,
        message: transaction.message,
        createdAt: transaction.created_at,
        gift: transaction.gift
      }
    })

  } catch (error) {
    console.error('Error fetching transaction status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
