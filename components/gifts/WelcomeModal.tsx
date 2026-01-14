'use client'

import { useState, useEffect } from 'react'

interface WelcomeModalProps {
  onClose: () => void
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideGiftsWelcome', 'true')
    }
    onClose()
  }

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con decoración */}
        <div className="bg-gradient-to-br from-wedding-rose/10 via-wedding-purple/10 to-wedding-sage/10 p-8 text-center border-b border-gray-100">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-wedding-rose" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 20 L60 40 L80 45 L65 60 L68 80 L50 70 L32 80 L35 60 L20 45 L40 40 Z"/>
            </svg>
          </div>
          <h2 
            id="welcome-modal-title"
            className="text-3xl md:text-4xl font-serif text-wedding-forest mb-2"
          >
            Bienvenidos a Nuestra Mesa de Regalos
          </h2>
          <div className="flex items-center justify-center mt-4">
            <div className="h-px bg-wedding-forest/20 w-16"></div>
            <div className="mx-4 w-3 h-3 bg-wedding-rose rounded-full"></div>
            <div className="h-px bg-wedding-forest/20 w-16"></div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            Como empezamos una nueva vida juntos, su aporte nos ayudará mucho a construir nuestro hogar 
            y crear hermosos recuerdos. Cada contribución, sin importar el monto, es muy especial para nosotros.
          </p>

          {/* Métodos de pago */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-serif text-wedding-forest text-center mb-4">
              Opciones de Pago Disponibles
            </h3>
            
            <div className="space-y-3">
              {/* Tarjeta */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 bg-wedding-purple/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-wedding-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Pago con Tarjeta</h4>
                  <p className="text-sm text-gray-600">Débito o crédito (Payphone)</p>
                </div>
              </div>

              {/* Transferencia Ecuador */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 bg-wedding-rose/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-wedding-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Transferencia Ecuatoriana</h4>
                  <p className="text-sm text-gray-600">Banco Pichincha - Validación automática con IA</p>
                </div>
              </div>

              {/* Transferencia México */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 bg-wedding-sage/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-wedding-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Transferencia Mexicana</h4>
                  <p className="text-sm text-gray-600">BBVA México - Validación automática con IA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nota importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800">
                <strong>Validación Automática:</strong> Al pagar por transferencia, solo sube tu comprobante 
                y nuestra IA lo validará automáticamente en segundos.
              </p>
            </div>
          </div>

          {/* Checkbox - No mostrar de nuevo */}
          <div className="flex items-center justify-center pt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-wedding-purple border-gray-300 rounded focus:ring-wedding-purple focus:ring-2"
              />
              <span className="text-sm text-gray-600">No mostrar este mensaje de nuevo</span>
            </label>
          </div>
        </div>

        {/* Footer con botón */}
        <div className="px-8 pb-8">
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-wedding-rose to-wedding-purple text-white px-8 py-4 rounded-full 
                     font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                     transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-wedding-purple/30"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
