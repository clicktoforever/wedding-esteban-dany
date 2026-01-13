'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function ConfirmPaymentContent() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Capturar parámetros de PayPhone
  const id = searchParams.get('id')
  const clientTransactionId = searchParams.get('clientTransactionId')

  const handleContinue = async () => {
    if (!id || !clientTransactionId) {
      setError('Faltan parámetros de confirmación')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
    const response = await fetch(`${process.env.PAYPHONE_API_URL}/api/button/V2/Confirm`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYPHONE_TOKEN}`
      },
      body: JSON.stringify({ id, clientTxId: clientTransactionId })
    })

      if (!response.ok) {
        throw new Error('Error al procesar la confirmación')
      }

      const result = await response.json()
      
      if (result.success) {
        // Redirigir a la página de regalos con mensaje de éxito
        window.location.href = '/gifts?payment=success'
      } else {
        setError(result.error || 'Error al confirmar el pago')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error al procesar la confirmación. Por favor, contacta al soporte.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icono de éxito */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Mensaje de agradecimiento */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Gracias por tu Aporte!
        </h1>
        <p className="text-gray-600 mb-8">
          Tu contribución ha sido procesada exitosamente. Estamos muy agradecidos por tu generosidad.
        </p>

        {/* Error si existe */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Botón Continuar */}
        <button
          onClick={handleContinue}
          disabled={isProcessing || !id || !clientTransactionId}
          className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            'Continuar'
          )}
        </button>

        {/* Parámetros debug (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-left">
            <p className="font-mono text-gray-600">Debug:</p>
            <p className="font-mono text-gray-600">ID: {id || 'N/A'}</p>
            <p className="font-mono text-gray-600">ClientTxId: {clientTransactionId || 'N/A'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConfirmPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmPaymentContent />
    </Suspense>
  )
}
