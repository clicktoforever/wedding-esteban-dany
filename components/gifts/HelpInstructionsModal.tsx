'use client'

import { useEffect } from 'react'

interface HelpInstructionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpInstructionsModal({ isOpen, onClose }: HelpInstructionsModalProps) {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-instructions-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-wedding-purple/10 to-wedding-rose/10 p-6 border-b border-gray-100 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-wedding-purple/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-wedding-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 
                id="help-instructions-title"
                className="text-2xl font-serif text-wedding-forest"
              >
                ¿Cómo Contribuir?
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Intro */}
          <div className="bg-wedding-sage/5 border border-wedding-sage/20 rounded-xl p-4">
            <p className="text-gray-700 text-center">
              Selecciona un regalo y elige tu método de pago preferido. 
              <strong className="text-wedding-forest"> Tu aporte se sumará al total del regalo.</strong>
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center">
              <svg className="w-5 h-5 mr-2 text-wedding-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              3 Métodos de Pago Disponibles
            </h3>

            {/* Method 1 */}
            <div className="bg-white border-2 border-wedding-purple/20 rounded-xl p-4 hover:border-wedding-purple/40 transition-all">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-wedding-purple/10 rounded-full flex items-center justify-center text-wedding-purple font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Tarjeta de Crédito/Débito</h4>
                  <p className="text-sm text-gray-600">Pago inmediato y seguro con Payphone</p>
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ✓ Aprobación automática
                  </span>
                </div>
              </div>
            </div>

            {/* Method 2 */}
            <div className="bg-white border-2 border-wedding-rose/20 rounded-xl p-4 hover:border-wedding-rose/40 transition-all">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-wedding-rose/10 rounded-full flex items-center justify-center text-wedding-rose font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Transferencia Ecuador 🇪🇨</h4>
                  <p className="text-sm text-gray-600">Banco Pichincha - Sube tu comprobante</p>
                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    ⚡ Validación con IA en minutos
                  </span>
                </div>
              </div>
            </div>

            {/* Method 3 */}
            <div className="bg-white border-2 border-wedding-sage/20 rounded-xl p-4 hover:border-wedding-sage/40 transition-all">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-wedding-sage/10 rounded-full flex items-center justify-center text-wedding-sage font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Transferencia México 🇲🇽</h4>
                  <p className="text-sm text-gray-600">Santander - Sube tu comprobante</p>
                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    ⚡ Validación con IA en minutos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gradient-to-br from-wedding-purple/5 to-wedding-rose/5 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-wedding-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pasos Simples
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-wedding-purple mr-2">1.</span>
                <span>Haz clic en "Contribuir" en el regalo que elijas</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-wedding-purple mr-2">2.</span>
                <span>Selecciona tu método de pago preferido</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-wedding-purple mr-2">3.</span>
                <span>Ingresa el monto que deseas aportar</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-wedding-purple mr-2">4.</span>
                <span>Completa el pago y ¡listo! Tu aporte se sumará al regalo</span>
              </li>
            </ol>
          </div>

          {/* Info Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Contribuciones Flexibles</p>
                <p className="text-xs text-amber-700 mt-1">
                  Puedes aportar cualquier monto. Cuando el regalo alcance su total, 
                  se marcará como completado automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-wedding-forest text-white rounded-xl 
                     font-medium hover:bg-wedding-purple transition-colors 
                     focus:outline-none focus:ring-4 focus:ring-wedding-purple/30"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
