'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'

function ConfirmPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clientTransactionId = searchParams.get('clientTransactionId')
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const donorName = searchParams.get('donorName')
  const amount = searchParams.get('amount')
  const giftName = searchParams.get('giftName')
  const giftImage = searchParams.get('giftImage')
  const transactionId = searchParams.get('transactionId')
  const currency = searchParams.get('currency') || 'USD'

  const [loading, setLoading] = useState(true)
  const [transactionData, setTransactionData] = useState<any>(null)

  useEffect(() => {
    if (clientTransactionId) {
      // Fetch transaction details
      fetch(`/api/gifts/transaction-status?clientTransactionId=${clientTransactionId}`)
        .then(res => res.json())
        .then(data => {
          setTransactionData(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [clientTransactionId])

  const isApproved = status === 'approved' || transactionData?.status === 'APPROVED'
  const isReview = status === 'manual_review' || status === 'review' || transactionData?.status === 'PENDING'
  const isError = status === 'error' || status === 'rejected' || transactionData?.status === 'REJECTED'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando información...</p>
        </div>
      </div>
    )
  }

  // Success Page
  if (isApproved) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Confetti decoration */}
          <div className="relative mb-6">
            <div className="absolute -top-4 -left-8 w-3 h-3 bg-[#E6B34A] rounded-full opacity-60" />
            <div className="absolute -top-2 right-0 w-2 h-4 bg-[#f3cccc] rotate-45 opacity-60" />
            <div className="absolute bottom-0 -left-4 w-4 h-2 bg-primary/40 -rotate-12 opacity-60" />
            
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-14 h-14 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            ¡Muchas Gracias, {donorName || 'Amigo'}!
          </h1>
          <p className="text-primary text-xl mb-8">
            ¡Ya eres parte de este regalo!
          </p>

          {/* Gift Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
            {giftImage && (
              <div className="relative w-full h-48">
                <Image
                  src={giftImage}
                  alt={giftName || 'Regalo'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="p-6">
              {giftName && (
                <h3 className="text-xl font-bold text-gray-900 mb-2">{giftName}</h3>
              )}
              <div className="flex flex-col items-center py-4 border-t border-dashed border-gray-200 mt-4">
                <span className="text-5xl font-bold text-primary">
                  {amount || '$0.00'}
                </span>
                <span className="text-sm text-gray-400 mt-2 uppercase tracking-wider">
                  Monto de Contribución
                </span>
              </div>
              {clientTransactionId && (
                <div className="px-4 py-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm mt-4">
                  <span className="text-gray-500">ID de Transacción</span>
                  <span className="font-mono font-bold text-gray-900">#{clientTransactionId.slice(0, 12)}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push('/gifts')}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>Volver a Mesa de Regalos</span>
          </button>
        </div>
      </div>
    )
  }

  // Manual Review Page
  if (isReview) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="mb-6 bg-[#d3c3db]/20 p-4 rounded-full">
                <svg className="w-12 h-12 text-[#d3c3db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Comprobante Recibido
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Estamos verificando los detalles. Tu aporte está seguro, te avisaremos pronto.
              </p>

              <div className="w-full border-t border-dashed border-gray-200 pt-6 space-y-4">
                {giftName && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background-light rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 opacity-60">
                        Regalo seleccionado
                      </p>
                      <p className="font-medium text-gray-900">{giftName}</p>
                    </div>
                  </div>
                )}

                {amount && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background-light rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 opacity-60">
                        Monto del aporte
                      </p>
                      <p className="font-bold text-lg text-primary">
                        {amount}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                En revisión manual
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/gifts')}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Entendido
          </button>
          <p className="mt-4 text-sm text-gray-500 text-center px-4 leading-normal">
            Recibirás un mensaje por WhatsApp después de que los novios confirmen la recepción del regalo
          </p>
        </div>
      </div>
    )
  }

  // Error Page
  if (isError) {
    const whatsappMessage = encodeURIComponent(
      `Hola Esteban y Dany 💕\n\nTuve un inconveniente al realizar mi aporte para el regalo "${giftName || 'Mesa de Regalos'}".\n\nDetalles del aporte:\n• Monto: ${amount || 'No especificado'}\n• Nombre: ${donorName || 'No especificado'}${clientTransactionId ? `\n• ID Transacción: ${clientTransactionId}` : ''}\n\n¿Me podrían ayudar a completarlo? ¡Muchas gracias! 🎁`
    )

    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="pt-10 pb-6 px-8 flex flex-col items-center text-center">
              <div className="mb-6 bg-[#996678]/10 p-4 rounded-full">
                <svg className="w-12 h-12 text-[#996678]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Hubo un pequeño problema técnico
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                No te preocupes, no se realizó ningún cargo. ¿Quieres intentar de nuevo?
              </p>
            </div>

            <div className="relative h-4 flex items-center">
              <div className="absolute -left-3 w-6 h-6 bg-background-light rounded-full" />
              <div className="w-full border-t-2 border-dashed border-gray-100 mx-4" />
              <div className="absolute -right-3 w-6 h-6 bg-background-light rounded-full" />
            </div>

            <div className="p-8 space-y-3 opacity-50">
              {giftName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 uppercase tracking-wider">Regalo</span>
                  <span className="text-sm font-bold text-gray-900">{giftName}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 uppercase tracking-wider">Monto</span>
                  <span className="text-sm font-bold text-gray-900">{amount}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/gifts')}
              className="w-full h-14 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Intentar de Nuevo
            </button>
            <a
              href={`https://wa.me/593968508240?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 border-2 border-[#996678]/20 text-[#996678] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#996678]/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Contactar a los Novios</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Default/Loading state
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Procesando tu pago...</p>
      </div>
    </div>
  )
}

export default function ConfirmPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmPaymentContent />
    </Suspense>
  )
}

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
