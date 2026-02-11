'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

function ConfirmPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const donorName = searchParams.get('donorName')
  const amount = searchParams.get('amount')
  const currency = searchParams.get('currency') || 'USD'
  const giftName = searchParams.get('giftName')
  const giftImage = searchParams.get('giftImage')
  const transactionId = searchParams.get('transactionId')
  const clientTransactionId = searchParams.get('clientTransactionId')

  const isApproved = status === 'approved'
  const isReview = status === 'review' || status === 'manual_review'
  const isError = status === 'error' || status === 'rejected'

  // Success Page with Confetti
  if (isApproved) {
    return (
      <div className="bg-background-light text-primary font-body min-h-screen flex flex-col overflow-hidden relative">
        {/* Confetti Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
          <div className="confetti-piece c-1"></div>
          <div className="confetti-piece c-2"></div>
          <div className="confetti-piece c-3"></div>
          <div className="confetti-piece c-4"></div>
          <div className="confetti-piece c-5"></div>
          <div className="confetti-piece c-6"></div>
          <div className="confetti-piece c-7"></div>
          <div className="confetti-piece c-8"></div>
          <div className="confetti-piece c-9"></div>
          <div className="confetti-piece c-10"></div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto px-6 lg:px-12 xl:px-20 py-8 lg:py-12 text-center">
          {/* Icon Section */}
          <div className="relative mb-8 lg:mb-12 animate-scale-in group">
            {/* Decorative Glow */}
            <div className="absolute inset-0 rounded-full bg-accent-light/20 blur-xl transform scale-150 animate-pulse-slow"></div>

            {/* Outer Gold Ring */}
            <div className="relative flex items-center justify-center w-28 h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full border-[3px] lg:border-4 border-accent-light bg-white shadow-xl shadow-accent-light/10 transition-all duration-300">
              {/* Inner Green Check */}
              <svg className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 text-primary transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[10deg]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Decorative Sparkles */}
            <svg className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 text-accent-light animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <svg className="absolute bottom-0 -left-4 w-4 h-4 lg:w-5 lg:h-5 text-accent-light/60 animate-bounce delay-100" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>

          {/* Headline Block */}
          <div className="space-y-4 lg:space-y-6 mb-8 lg:mb-10 animate-fade-in-up delay-200">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-primary leading-tight transition-all duration-300">
              ¡Muchas Gracias,<br />
              <span className="italic text-accent-light">{donorName || 'Amigo'}!</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 font-medium leading-relaxed max-w-[320px] lg:max-w-md xl:max-w-lg mx-auto transition-all duration-300">
              Tu generosidad nos ayuda a construir nuestro futuro juntos.
            </p>
          </div>

          {/* Gift Card */}
          {(giftImage || giftName) && (
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8 animate-fade-in-up delay-300">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{giftName}</h3>
                )}
                <div className="flex flex-col items-center py-4 border-t border-dashed border-gray-200">
                  <span className="text-4xl lg:text-5xl font-bold text-primary">
                    {amount || '$0.00'}
                  </span>
                  <span className="text-sm text-gray-400 mt-2 uppercase tracking-wider">
                    Monto de Contribución
                  </span>
                </div>
                {(clientTransactionId || transactionId) && (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm mt-4">
                    <span className="text-gray-500">ID de Transacción</span>
                    <span className="font-mono font-bold text-gray-900">
                      #{(clientTransactionId || transactionId || '').slice(0, 12)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="w-full flex items-center justify-center gap-4 lg:gap-6 mb-8 lg:mb-10 opacity-60 animate-fade-in-up delay-400">
            <div className="h-[1px] w-12 lg:w-16 xl:w-20 bg-gradient-to-r from-transparent to-accent-light"></div>
            <svg className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-accent-light" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <div className="h-[1px] w-12 lg:w-16 xl:w-20 bg-gradient-to-l from-transparent to-accent-light"></div>
          </div>

          {/* Action Button */}
          <Link
            href="/gifts"
            className="group relative w-full max-w-md overflow-hidden rounded-xl bg-primary text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 block animate-fade-in-up delay-500"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative flex items-center justify-center gap-3 py-4 lg:py-5 xl:py-6 px-6 lg:px-8">
              <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-lg lg:text-xl tracking-wide">Volver a Mesa de Regalos</span>
            </div>
          </Link>
        </main>

        <style jsx>{`
          .confetti-piece {
            position: absolute;
            top: -20px;
            width: 10px;
            height: 20px;
            border-radius: 4px;
            z-index: 0;
            opacity: 0;
          }
          
          .c-1 { left: 10%; background-color: #967bb6; animation: fall 4s linear infinite; animation-delay: 0s; }
          .c-2 { left: 20%; background-color: #355E3B; width: 12px; height: 12px; border-radius: 50%; animation: fall 3s linear infinite; animation-delay: 1.5s; }
          .c-3 { left: 35%; background-color: #E6E6FA; animation: fall 4s linear infinite; animation-delay: 0.5s; }
          .c-4 { left: 50%; background-color: #967bb6; animation: fall 2.5s linear infinite; animation-delay: 2s; }
          .c-5 { left: 65%; background-color: #355E3B; animation: fall 3s linear infinite; animation-delay: 1s; }
          .c-6 { left: 80%; background-color: #967bb6; width: 15px; height: 15px; border-radius: 50%; animation: fall 2.5s linear infinite; animation-delay: 2.5s; }
          .c-7 { left: 90%; background-color: #E6E6FA; animation: fall 4s linear infinite; animation-delay: 0.2s; }
          .c-8 { left: 15%; background-color: #967bb6; animation: fall 3s linear infinite; animation-delay: 3s; }
          .c-9 { left: 45%; background-color: #967bb6; width: 8px; height: 25px; animation: fall 3s linear infinite; animation-delay: 1.2s; }
          .c-10 { left: 70%; background-color: #355E3B; animation: fall 4s linear infinite; animation-delay: 0.8s; }
          
          @keyframes fall {
            0% { transform: translateY(-20vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
          }
          
          .animate-scale-in {
            animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .delay-100 {
            animation-delay: 100ms;
          }
          
          .delay-200 {
            animation-delay: 200ms;
          }
          
          .delay-300 {
            animation-delay: 300ms;
          }
          
          .delay-400 {
            animation-delay: 400ms;
          }
          
          .delay-500 {
            animation-delay: 500ms;
          }
          
          @keyframes scaleIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes fadeInUp {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}</style>
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
            Recibirás un correo electrónico después de que los novios confirmen la recepción del regalo
          </p>
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
