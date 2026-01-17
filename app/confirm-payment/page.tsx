'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

function ConfirmPaymentContent() {
  const searchParams = useSearchParams()
  const clientTransactionId = searchParams.get('clientTransactionId')
  const type = searchParams.get('type') // 'payphone' o 'transfer'
  const status = searchParams.get('status') // 'approved', 'rejected', 'manual_review', 'processing'
  const country = searchParams.get('country')
  const amount = searchParams.get('amount')
  const donorName = searchParams.get('donorName')
  const giftName = searchParams.get('giftName')
  const [countdown, setCountdown] = useState(45)

  // Determinar mensajes según el estado
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'
  const isManualReview = status === 'manual_review'
  const isProcessing = !status || status === 'processing'

  const getTitle = () => {
    if (isApproved) return '¡Gracias por tu Contribución! 🎉'
    if (isRejected) return 'Comprobante No Válido ❌'
    if (isManualReview) return 'En Revisión Manual 🔍'
    return '¡Gracias por tu Contribución! 🎉'
  }

  const getMessage = () => {
    if (type === 'transfer') {
      if (isApproved) return 'Tu comprobante ha sido validado exitosamente'
      if (isRejected) return 'La imagen no es un comprobante válido'
      if (isManualReview) return 'Tu comprobante requiere revisión manual'
      return 'Tu comprobante está siendo validado'
    }
    return 'Tu aporte está siendo procesado'
  }
  
  const getDetailedMessage = () => {
    if (type === 'transfer') {
      if (isApproved) return 'Tu aporte ya está reflejado en la mesa de regalos. ¡Muchas gracias!'
      if (isRejected) return 'Por favor verifica que hayas subido la imagen correcta del comprobante de transferencia bancaria y que los datos coincidan con la cuenta destino.'
      if (isManualReview) return 'Nuestro equipo revisará tu comprobante manualmente. Te notificaremos cuando sea aprobado. Esto puede deberse a errores técnicos o información poco clara en el comprobante.'
      return 'Validaremos tu comprobante y te notificaremos cuando tu aporte sea aprobado.'
    }
    return 'Recibirás una confirmación por correo electrónico cuando tu transacción sea aprobada.'
  }

  const getIconColor = () => {
    if (isApproved) return 'from-green-400 to-green-600'
    if (isRejected) return 'from-red-400 to-red-600'
    if (isManualReview) return 'from-yellow-400 to-yellow-600'
    return 'from-green-400 to-green-600'
  }

  const getIcon = () => {
    if (isApproved) return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    if (isRejected) return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    if (isManualReview) return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  }

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirigir con timestamp para forzar recarga
          window.location.href = `/gifts?t=${Date.now()}`
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-rose-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icono animado */}
        <div className="mb-6">
          <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${getIconColor()} rounded-full flex items-center justify-center animate-bounce`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon()}
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {getTitle()}
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          {getMessage()}
        </p>

        <p className="text-gray-500 mb-6">
          {getDetailedMessage()}
        </p>

        {/* Detalles de la contribución */}
        {(donorName || amount || giftName) && (
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-5 mb-6 text-left">
            <h3 className="font-semibold text-teal-900 mb-3 text-center">Detalles de tu Aporte</h3>
            {donorName && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium text-gray-900">{donorName}</span>
              </div>
            )}
            {giftName && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Regalo:</span>
                <span className="font-medium text-gray-900">{giftName}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Monto:</span>
                <span className="font-bold text-teal-700 text-lg">${amount}</span>
              </div>
            )}
            {country && type === 'transfer' && (
              <div className="flex justify-between">
                <span className="text-gray-600">País:</span>
                <span className="font-medium text-gray-900">{country === 'EC' ? 'Ecuador 🇪🇨' : 'México 🇲🇽'}</span>
              </div>
            )}
          </div>
        )}

        {/* Info de transacción */}
        {clientTransactionId && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-teal-900 font-mono break-all">
              <strong className="block mb-1">ID de Transacción:</strong>
              {clientTransactionId}
            </p>
          </div>
        )}

        {/* Countdown */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Redirigiendo en <span className="font-bold text-teal-600">{countdown}</span> segundos...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-teal-600 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(45 - countdown) * 2.22}%` }}
            ></div>
          </div>
        </div>

        {/* Botón manual */}
        <a
          href={`/gifts?t=${Date.now()}`}
          className="inline-block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Volver a Mesa de Regalos Ahora
        </a>

        {/* Mensaje adicional */}
        <p className="text-xs text-gray-400 mt-6">
          Tu generosidad nos ayuda a comenzar nuestra nueva vida juntos. ¡Nos vemos en la boda!
        </p>
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
