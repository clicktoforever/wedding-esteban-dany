import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Log all params to debug
    console.log('=== CONFIRM PAYMENT CALLBACK - REDIRECTING ===')
    console.log('All query params:', Object.fromEntries(searchParams.entries()))
    
    // Get params - try different variations due to possible typos from PayPhone
    const clientTransactionId = searchParams.get('clientTransactionId') || 
                                 searchParams.get('clientTransaciontIde') ||
                                 searchParams.get('clientTxId')
    const id = searchParams.get('id')

    console.log('Extracted params:', { clientTransactionId, id })

    if (!clientTransactionId || !id) {
      console.error('Missing required params:', { clientTransactionId, id })
      // Redirect to error page
      return NextResponse.redirect(new URL('/gifts?payment=error', request.url))
    }

    // Redirect to the new confirmation page with the same params
    const confirmUrl = new URL('/confirm-payment', request.url)
    confirmUrl.searchParams.set('id', id)
    confirmUrl.searchParams.set('clientTransactionId', clientTransactionId)
    
    console.log('Redirecting to:', confirmUrl.toString())
    return NextResponse.redirect(confirmUrl)

  } catch (error) {
    console.error('Confirm payment callback error:', error)
    return NextResponse.redirect(new URL('/gifts?payment=error', request.url))
  }
}
