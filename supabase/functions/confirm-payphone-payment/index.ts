// Supabase Edge Function para confirmar pagos con PayPhone
// Deploy: supabase functions deploy confirm-payphone-payment
// Logs: supabase functions logs confirm-payphone-payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const PAYPHONE_TOKEN = Deno.env.get('PAYPHONE_TOKEN')!
const PAYPHONE_API_URL = 'https://pay.payphonetodoesposible.com'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface PayPhoneConfirmResponse {
  transactionStatus: string
  transactionId: string
  statusDetail?: string
}

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    console.log('Processing transaction:', {
      id: record.id,
      status: record.status,
      payphoneId: record.payphone_transaction_id,
      clientTxId: record.payphone_client_transaction_id,
    })

    // Only process PENDING transactions with PayPhone ID
    if (record.status !== 'PENDING' || !record.payphone_transaction_id) {
      console.log('Skipping: not a pending transaction with PayPhone ID')
      return new Response(
        JSON.stringify({ message: 'Not a pending transaction' }), 
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Wait 3 seconds for PayPhone to fully process
    console.log('Waiting 3 seconds before confirmation...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Call PayPhone Confirm API
    console.log('Calling PayPhone V2/Confirm API...')
    const response = await fetch(`${PAYPHONE_API_URL}/api/button/V2/Confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYPHONE_TOKEN}`,
      },
      body: JSON.stringify({
        id: parseInt(record.payphone_transaction_id),
        clientTxId: record.payphone_client_transaction_id,
      }),
    })

    console.log('PayPhone response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PayPhone API error:', errorText.substring(0, 500))
      throw new Error(`PayPhone returned ${response.status}`)
    }

    const confirmResult: PayPhoneConfirmResponse = await response.json()
    console.log('PayPhone confirmation result:', confirmResult)

    // Update transaction based on PayPhone response
    if (confirmResult.transactionStatus === 'Approved') {
      console.log('Payment approved, calling RPC to update transaction...')
      
      // Call RPC to approve transaction atomically
      const rpcResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/approve_gift_transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          p_transaction_id: record.id,
        }),
      })

      if (!rpcResponse.ok) {
        const errorText = await rpcResponse.text()
        console.error('RPC error:', errorText)
        throw new Error(`Failed to approve transaction: ${errorText}`)
      }

      const rpcResult = await rpcResponse.json()
      console.log('Transaction approved successfully:', rpcResult)

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'CONFIRMED',
          result: rpcResult 
        }), 
        { headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      console.log('Payment not approved, marking as rejected...')
      
      // Mark as rejected
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/gift_transactions?id=eq.${record.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            status: 'REJECTED',
            payphone_status: confirmResult.transactionStatus,
          }),
        }
      )

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        console.error('Update error:', errorText)
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          status: 'REJECTED',
          transactionStatus: confirmResult.transactionStatus,
          statusDetail: confirmResult.statusDetail 
        }), 
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})
