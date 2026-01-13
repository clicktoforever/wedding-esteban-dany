// PayPhone Integration Types and Utilities
// Documentation: https://www.docs.payphone.app/cajita-de-pagos-payphone

export interface PayPhonePaymentRequest {
  // Required fields
  amount: number // Total amount in cents (e.g., 1050 = $10.50)
  amountWithoutTax: number // Amount without tax in cents
  clientTransactionId: string // Unique transaction ID per payment
  currency: string // "USD" for Ecuador
  storeId: string // Your PayPhone Store ID
  
  // Tax breakdown
  amountWithTax?: number // Amount with tax in cents
  tax?: number // Tax amount in cents
  service?: number // Service fee in cents
  tip?: number // Tip amount in cents
  
  // Customer information (optional but recommended)
  email?: string
  phoneNumber?: string // Format: +593999999999
  documentId?: string // ID number
  identificationType?: 1 | 2 | 3 // 1=Cédula, 2=RUC, 3=Pasaporte
  
  // Transaction details
  reference?: string // Reference description
  optionalParameter?: string
  
  // URLs for callbacks
  cancellationUrl?: string // URL to redirect on cancellation
  responseUrl?: string // URL to redirect after payment
  
  // Location data (optional)
  lat?: string
  lng?: string
  timeZone?: number // e.g., -5 for Ecuador
  
  // UI preferences
  lang?: 'es' | 'en' // Language
  defaultMethod?: 'card' | 'payphone' // Default payment method
}

export interface PayPhonePaymentResponse {
  payWithPhone?: string // Payment URL to redirect user
  transactionId?: string // PayPhone transaction ID
  transactionStatus?: number // Transaction status code
  clientTransactionId?: string // Echo of your client transaction ID
  statusCode?: number
  message?: string
  error?: string
}

export interface PayPhoneConfirmationRequest {
  id: string // Transaction ID from PayPhone
  clientTxId: string // Your client transaction ID
}

export interface PayPhoneConfirmationResponse {
  statusCode?: number
  message?: string
  transactionStatus?: 'Approved' | 'Pending' | 'Cancelled' | 'Rejected'
  transactionId?: string
  clientTransactionId?: string
  amount?: number
  phoneNumber?: string
  email?: string
  documentId?: string
  cardType?: string
  lastDigits?: string
  authorizationCode?: string
  reference?: string
  statusDetail?: string
}

/**
 * Creates a PayPhone payment request
 * @param config - Payment configuration
 * @returns PayPhone API request payload
 */
export function createPayPhonePayment(config: {
  amount: number // Amount in dollars (will be converted to cents)
  donorName: string
  donorEmail?: string
  clientTransactionId: string
  reference: string
  responseUrl?: string
  cancellationUrl?: string
}): PayPhonePaymentRequest {
  const amountInCents = Math.round(config.amount * 100)
  
  const payload: PayPhonePaymentRequest = {
    amount: amountInCents,
    amountWithoutTax: amountInCents, // Assuming no tax for gifts
    currency: 'USD',
    storeId: process.env.PAYPHONE_STORE_ID || '',
    clientTransactionId: config.clientTransactionId,
    reference: config.reference,
  }

  // Add optional fields only if they have values
  if (config.donorEmail) {
    payload.email = config.donorEmail
  }
  
  if (config.responseUrl) {
    payload.responseUrl = config.responseUrl
  }
  
  if (config.cancellationUrl) {
    payload.cancellationUrl = config.cancellationUrl
  }

  return payload
}

/**
 * Calls PayPhone API to prepare a payment
 * @param paymentData - Payment request data
 * @returns Payment response with payment URL
 */
export async function preparePayPhonePayment(
  paymentData: PayPhonePaymentRequest
): Promise<PayPhonePaymentResponse> {
  const token = process.env.PAYPHONE_TOKEN
  const apiUrl = process.env.PAYPHONE_API_URL || 'https://pay.payphonetodoesposible.com'
  
  if (!token) {
    throw new Error('PAYPHONE_TOKEN is not configured')
  }
  
  if (!paymentData.storeId) {
    throw new Error('PAYPHONE_STORE_ID is not configured')
  }

  console.log('PayPhone API Request:', {
    url: `${apiUrl}/api/button/Prepare`,
    storeId: paymentData.storeId,
    amount: paymentData.amount,
    clientTransactionId: paymentData.clientTransactionId
  })
  
  try {
    const response = await fetch(`${apiUrl}/api/button/Prepare`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })
    
    const responseText = await response.text()
    console.log('PayPhone API Response Status:', response.status)
    console.log('PayPhone API Response:', responseText.substring(0, 500))
    
    if (!response.ok) {
      throw new Error(`PayPhone API error: ${response.status} - ${responseText}`)
    }
    
    const result: PayPhonePaymentResponse = JSON.parse(responseText)
    return result
  } catch (error) {
    console.error('PayPhone API Error:', error)
    throw error
  }
}

/**
 * Confirms payment status with PayPhone
 * @param transactionId - PayPhone transaction ID
 * @param clientTransactionId - Your client transaction ID
 * @returns Confirmation response with payment status
 */
export async function confirmPayPhonePayment(
  transactionId: string,
  clientTransactionId: string
): Promise<PayPhoneConfirmationResponse> {
  const token = process.env.PAYPHONE_TOKEN?.trim()
  const apiUrl = process.env.PAYPHONE_API_URL || 'https://pay.payphonetodoesposible.com'
  
  if (!token) {
    throw new Error('PAYPHONE_TOKEN is not configured')
  }
  
  try {
    console.log('Confirming PayPhone payment:', { transactionId, clientTransactionId })
    
    // Wait 2 seconds before confirming (PayPhone may need time to process)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const body = {
      id: parseInt(transactionId) || 0,
      clientTxId: clientTransactionId,
    }
    
    console.log('Request URL:', `${apiUrl}/api/button/V2/Confirm`)
    console.log('Request body:', JSON.stringify(body))
    console.log('Token present:', !!token)
    console.log('Token length:', token?.length)
    console.log('Token first 20 chars:', token?.substring(0, 20))
    
    const response = await fetch(`${apiUrl}/api/button/V2/Confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('PayPhone confirmation failed:', { status: response.status, error: errorText.substring(0, 500) })
      throw new Error(`PayPhone confirmation error: ${response.status}`)
    }
    
    const result: PayPhoneConfirmationResponse = await response.json()
    console.log('PayPhone confirmation result:', result)
    return result
  } catch (error) {
    console.error('PayPhone Confirmation Error:', error)
    throw error
  }
}

/**
 * Generates a unique client transaction ID
 */
export function generateClientTransactionId(giftId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `GIFT-${giftId.substring(0, 8)}-${timestamp}-${random}`.toUpperCase()
}

/**
 * Converts dollars to cents for PayPhone API
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Converts cents to dollars for display
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}
