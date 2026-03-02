'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { CldImage } from 'next-cloudinary'
import Link from 'next/link'

import confetti from 'canvas-confetti'

const loadingMessages = [
  'Verificando...',
  'Llamando a PayPhone...',
  'Acomodando tu regalo...',
  '¡Ya casi terminamos!'
]

function ConfirmPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const donorName = searchParams.get('donorName')
  const amount = searchParams.get('amount')
  const currency = searchParams.get('currency') || 'USD'
  const giftName = searchParams.get('giftName')
  const transactionId = searchParams.get('transactionId')
  const clientTransactionId = searchParams.get('clientTransactionId')

  const [currentStatus, setCurrentStatus] = useState(status)
  const [pollingCount, setPollingCount] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState(0)
  const [isCoinLoaded, setIsCoinLoaded] = useState(false)

  const isApproved = currentStatus === 'approved'
  const isReview = currentStatus === 'review' || currentStatus === 'manual_review'
  const isError = currentStatus === 'error' || currentStatus === 'rejected'

  // Rotate loading messages every 3 seconds
  useEffect(() => {
    if (type === 'payphone' && isReview) {
      const messageInterval = setInterval(() => {
        setLoadingMessage(prev => (prev + 1) % loadingMessages.length)
      }, 3000)

      return () => clearInterval(messageInterval)
    }
  }, [type, isReview])

  // Poll transaction status for PayPhone payments in review
  useEffect(() => {
    if (type === 'payphone' && isReview && transactionId && pollingCount < 30) {
      // Poll every 2 seconds for 1 minute (30 attempts)
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/gifts/transaction-status?id=${transactionId}`)
          const data = await response.json()

          if (data.transaction?.status === 'APPROVED') {
            // Payment confirmed! Update to approved state
            setCurrentStatus('approved')
            clearInterval(interval)
          } else if (data.transaction?.status === 'REJECTED') {
            // Payment rejected
            setCurrentStatus('rejected')
            clearInterval(interval)
          } else {
            // Still processing, increment count
            setPollingCount(prev => prev + 1)
          }
        } catch (error) {
          console.error('Error polling transaction status:', error)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [type, isReview, transactionId, pollingCount])

  // Confetti Effect
  useEffect(() => {
    if (isApproved) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 } /* Increased zIndex */

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isApproved])

  // Success Page with Gamification (Reward Card)
  if (isApproved) {
    // Calculate Machi Coins (1 USD = 10 Coins)
    // Parse amount string to number, remove non-numeric chars if any (though usually it's clean)
    const numericAmount = parseFloat((amount || '0').replace(/[^0-9.]/g, '')) || 0
    const amountInUSD = currency === 'MXN' ? numericAmount / 20 : numericAmount
    const machiCoins = Math.floor(amountInUSD * 10)

    return (
      <div className="bg-background-light text-primary font-body min-h-screen flex flex-col items-center p-6 relative overflow-hidden pt-8 md:pt-14">

        {/* Main Content - Reward Card */}
        <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border-4 border-accent-lavender/50 animate-scale-in mt-2 md:mt-4">

          {/* Header */}
          <div className="mb-4 space-y-1">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
              ¡Muchas gracias,<br />
              <span className="text-secondary">{donorName || 'Amigo'}!</span>
            </h1>
            <p className="text-gray-500 text-base font-medium">
              Tu generosidad ya tiene recompensa.
            </p>
          </div>

          {/* Hero Image (Golden Coin) */}
          <div className={`relative w-36 h-36 mx-auto mb-4 transform transition-transform duration-500 ${isCoinLoaded ? 'animate-coin-flip' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full animate-pulse-slow"></div>
            <CldImage
              src="wedding/icons/machicoin"
              alt="Machi Coin"
              fill
              format="webp"
              quality="50"
              sizes="144px"
              className="object-contain drop-shadow-2xl"
              onLoad={() => setIsCoinLoaded(true)}
            />
          </div>

          {/* Reward Info */}
          <div className="mb-6 space-y-2">
            <div className="inline-block bg-accent-lavender/50 px-4 py-1.5 rounded-full mb-1">
              <span className="text-lg font-bold text-primary">
                ¡Has desbloqueado <span className="text-secondary text-xl">{machiCoins}</span> Machi Coins!
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed font-medium px-4">
              Tienes saldo disponible para gastar en la fiesta.<br />
              <span className="text-xs text-gray-400">(1 USD donado = 10 Machi Coins)</span>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="https://machiboda.clicktoforever.com" /* Updated redirection */
              className="block w-full py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl text-sm md:text-base shadow-lg shadow-secondary/30 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              IR A GASTAR MIS MONEDAS
            </Link>

            <Link
              href="/"
              className="block w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors text-xs uppercase tracking-wider"
            >
              Volver al inicio
            </Link>
          </div>

        </div>

        <style jsx>{`
          .animate-scale-in {
            animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
           .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .animate-coin-flip {
            animation: coinFlip 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          @keyframes scaleIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
           @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: .8; }
          }
          @keyframes coinFlip {
            0% { transform: rotateY(0deg) scale(0.5); opacity: 0; }
            50% { transform: rotateY(180deg) scale(1.1); opacity: 1; }
            100% { transform: rotateY(360deg) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  // PayPhone Processing Page (New UX)
  if (isReview && type === 'payphone') {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center pt-8 md:pt-14 p-6">
        <div className="max-w-lg w-full mt-2 md:mt-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
            <div className="p-6 md:p-8 flex flex-col items-center text-center">
              <div className="mb-4 relative w-20 h-20">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-20 h-20 object-contain"
                >
                  <source src="https://res.cloudinary.com/machiboda/video/upload/f_auto,q_auto/wedding/icons/loading.mp4" type="video/mp4" />
                </video>
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                Ya casi! 💍✨
              </h1>
              <p className="text-gray-500 text-base md:text-lg font-body leading-relaxed mb-6">
                Estamos validando tu aporte con PayPhone, solo toma unos segundos.
              </p>

              <div className="w-full border-t border-dashed border-gray-200 pt-4 space-y-3">
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

            <div className="bg-yellow-50 px-6 py-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse" />
              <span className="text-xs font-bold text-yellow-800 uppercase tracking-widest">
                {loadingMessages[loadingMessage]}
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 font-medium">
              Por favor, no cierres esta ventana. ¡Tu detalle está a un paso de ser oficial!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Manual Review Page (Original Design)
  if (isReview) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center pt-8 md:pt-14 p-6">
        <div className="max-w-lg w-full mt-2 md:mt-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
            <div className="p-6 md:p-8 flex flex-col items-center text-center">
              <div className="mb-4 bg-yellow-50 p-3 rounded-full">
                <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                Pago en proceso
              </h1>
              <p className="text-gray-500 text-base md:text-lg font-body leading-relaxed mb-6">
                Recibimos tu comprobante. En cuanto nuestro equipo lo valide, te llegarán tus Machi Coins al correo
              </p>

              <div className="w-full border-t border-dashed border-gray-200 pt-4 space-y-3">
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

            <div className="bg-yellow-50 px-6 py-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse" />
              <span className="text-xs font-bold text-yellow-800 uppercase tracking-widest">
                En revisión manual
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/gifts')}
            className="w-full h-12 md:h-14 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Entendido
          </button>

        </div>
      </div>
    )
  }

  // Error Page
  if (isError) {
    const whatsappMessage = encodeURIComponent(
      `Hola Carlos y Dany 💕\n\nTuve un inconveniente al realizar mi aporte para el regalo "${giftName || 'Mesa de Regalos'}".\n\nDetalles del aporte:\n• Monto: ${amount || 'No especificado'}\n• Nombre: ${donorName || 'No especificado'}${clientTransactionId ? `\n• ID Transacción: ${clientTransactionId}` : ''}\n\n¿Me podrían ayudar a completarlo? ¡Muchas gracias! 🎁`
    )

    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center pt-8 md:pt-14 p-6">
        <div className="max-w-lg w-full mt-2 md:mt-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
            <div className="pt-8 pb-4 px-6 md:px-8 flex flex-col items-center text-center">
              <div className="mb-4 bg-[#996678]/10 p-3 rounded-full">
                <svg className="w-10 h-10 text-[#996678]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Hubo un pequeño problema técnico
              </h1>
              <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                No te preocupes, no se realizó ningún cargo. ¿Quieres intentar de nuevo?
              </p>
            </div>

            <div className="relative h-4 flex items-center">
              <div className="absolute -left-3 w-6 h-6 bg-background-light rounded-full" />
              <div className="w-full border-t-2 border-dashed border-gray-100 mx-4" />
              <div className="absolute -right-3 w-6 h-6 bg-background-light rounded-full" />
            </div>

            <div className="p-6 space-y-2 opacity-50">
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

          <div className="space-y-3">
            <button
              onClick={() => router.push('/gifts')}
              className="w-full h-12 md:h-14 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Intentar de nuevo
            </button>
            <a
              href={`https://wa.me/593968508240?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 md:h-14 border-2 border-[#996678]/20 text-[#996678] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#996678]/5 transition-colors"
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
    <>
      <style jsx global>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
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
    </>
  )
}
