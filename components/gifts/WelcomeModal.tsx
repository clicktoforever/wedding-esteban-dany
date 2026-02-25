'use client'

import { useEffect } from 'react'

interface WelcomeModalProps {
  onClose: () => void
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4">
      {/* Background - blurred overlay */}
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-lg"></div>

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-cream rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Scrollable Content */}
        <div className="overflow-y-auto overscroll-contain pb-safe">
          {/* Header Section */}
          <div className="flex flex-col items-center pt-8 px-8 pb-3 text-center">
            <div className="mb-4 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                favorite
              </span>
            </div>
            <h1 className="font-serif text-[22px] leading-[1.2] text-text-main font-medium mb-5">
              Bienvenido a nuestra <br />
              <span className="italic text-hunter-green">Mesa de Regalos</span>
            </h1>
            <p className="text-text-muted text-[15px] leading-relaxed max-w-xs mx-auto font-medium">
              Su presencia es lo más importante. Pero si quieren ayudarnos a empezar nuestra aventura, aquí pueden sumar su granito de arena. ¡Es fácil, seguro y nos ayudas a cumplir sueños!
            </p>
          </div>

          {/* Payment Methods Section */}
          <div className="px-8 py-4 w-full flex flex-col items-center">
            <h4 className="text-warm-grey text-[10px] font-bold uppercase tracking-[0.15em] mb-4 text-center">
              Métodos de Pago Seguros
            </h4>
            <div className="flex items-center justify-center gap-6 mb-3 text-warm-grey">
              <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-3xl">credit_card</span>
                <span className="text-[10px] font-bold">PAYPHONE</span>
              </div>
              <div className="h-8 w-px bg-warm-grey/30"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-3xl">account_balance</span>
                <span className="text-[10px] font-bold">ECUADOR</span>
              </div>
              <div className="h-8 w-px bg-warm-grey/30"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-3xl">currency_exchange</span>
                <span className="text-[10px] font-bold">MÉXICO</span>
              </div>
            </div>
            <p className="text-[11px] text-warm-grey/80 text-center font-medium">
              Aceptamos todas las tarjetas y transferencias (Ecuador/México)
            </p>
            <p className="text-[10px] text-warm-grey/60 text-center font-medium mt-1">
              También contaremos con buzón de sobres en la boda.
            </p>
          </div>

          {/* Footer Section */}
          <div className="px-8 pt-3 pb-8 flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-2">
              <p className="font-serif italic text-text-muted text-sm text-center opacity-80">
                &ldquo;Gracias por ser parte de nuestra historia&rdquo;
              </p>
              <span className="text-2xl font-script text-hunter-green mt-1 block">
                Carlos &amp; Dany
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-hunter-green hover:bg-[#3d4a43] active:scale-[0.98] transition-all text-white font-bold h-12 rounded-xl text-[15px] shadow-xl shadow-hunter-green/20 flex items-center justify-center font-body"
            >
              Ver la Mesa de Regalos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
